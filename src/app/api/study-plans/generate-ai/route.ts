import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { runAI, AIError } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { customRequest } = await req.json();
    const userId = session.user.id;

    // 1. Fetch user's history if no custom request is provided
    let statsData = "";
    if (!customRequest) {
      const submissions = await prisma.submission.findMany({
        where: { userId },
        include: {
          problem: { select: { category: true, pattern: true, difficulty: true } }
        }
      });

      const stats: any = {};
      submissions.forEach(sub => {
        const cat = sub.problem.pattern || sub.problem.category;
        if (!stats[cat]) stats[cat] = { solved: 0, failed: 0, total: 0 };
        stats[cat].total++;
        if (sub.status === "Accepted") stats[cat].solved++;
        else stats[cat].failed++;
      });
      statsData = `User Stats: ${JSON.stringify(stats)}`;
    }

    // 2. AI decides on a topic and plan structure
    const systemPrompt = `You are a Senior Learning Architect. 
    Create a 2-day "Micro Study Plan".
    ${customRequest ? `Goal: ${customRequest}` : `Analyze weaknesses based on stats: ${statsData}`}

    Return ONLY JSON:
    {
      "topic": "The Topic Name",
      "title": "...",
      "description": "...",
      "problem1": { 
        "title": "...", 
        "type": "CODING" | "SQL" | "SYSTEM_DESIGN" | "READING",
        "difficulty": "Easy", 
        "description": "...", 
        "pattern": "...", 
        "testSets": [...], 
        "blueprint": [...],
        "referenceSolution": "...",
        "initialSchema": "...", 
        "initialData": "..."
      },
      "problem2": { 
        "title": "...", 
        "type": "CODING" | "SQL" | "SYSTEM_DESIGN" | "READING",
        "difficulty": "Medium", 
        "description": "...", 
        "pattern": "...", 
        "testSets": [...], 
        "blueprint": [...],
        "referenceSolution": "...",
        "initialSchema": "...", 
        "initialData": "..."
      }
    }
    
    CRITICAL: Use "READING" for theoretical or complex topics (ML, DevOps, etc.) where a documentation guide is more appropriate than a practice problem. For READING, provide a very detailed "description" with study materials.`;

    const userPrompt = customRequest ? `Create a plan for: ${customRequest}` : "Create a custom 2-day study plan based on my stats.";
    const responseText = await runAI(userPrompt, systemPrompt, true);
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const planData = JSON.parse(cleanJson);

    // --- AUDITOR PHASE: Fix hallucinations before saving ---
    const auditProblem = async (prob: any) => {
      console.log(`[AI Auditor] Auditing: ${prob.title}`);
      const auditPrompt = `
        You are a Quality Assurance Engineer for a coding platform. 
        Review the following generated problem and FIX any hallucinations.
        
        Problem: ${JSON.stringify(prob)}
        
        TASKS:
        1. Ensure "testSets" outputs are EXACTLY correct for the "referenceSolution".
        2. Ensure "blueprint" correct answers match one of the options character-for-character.
        3. Improve HTML formatting in "description".
        
        Return ONLY the corrected JSON object.
      `;
      try {
        const auditedText = await runAI(auditPrompt, "You are a precise JSON auditor.", true);
        const cleanAudit = auditedText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanAudit);
      } catch (e) {
        console.error("Audit failed, using original problem", e);
        return prob;
      }
    };

    console.log("[AI] Starting deep audit of generated problems...");
    const auditedP1 = await auditProblem(planData.problem1);
    const auditedP2 = await auditProblem(planData.problem2);

    // 3. Save the Study Plan and AI Problems to DB
    const createdPlan = await prisma.studyPlan.create({
      data: {
        title: planData.title,
        slug: planData.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        description: planData.description,
        isOfficial: false,
        isPublic: false,
        creatorId: userId,
        durationDays: 2,
      }
    });

    // Generate Problem 1
    const p1 = await prisma.problem.create({
      data: {
        title: auditedP1.title,
        slug: auditedP1.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        difficulty: auditedP1.difficulty || "Easy",
        category: planData.topic,
        description: auditedP1.description,
        type: auditedP1.type || "CODING",
        pattern: auditedP1.pattern,
        testSets: auditedP1.testSets,
        blueprint: auditedP1.blueprint,
        referenceSolution: auditedP1.referenceSolution,
        initialSchema: auditedP1.initialSchema,
        initialData: auditedP1.initialData,
        isVerified: false,
        source: "AI_GENERATED",
        creatorId: userId,
        isPublic: false,
      }
    });

    // Generate Problem 2
    const p2 = await prisma.problem.create({
      data: {
        title: auditedP2.title,
        slug: auditedP2.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        difficulty: auditedP2.difficulty || "Medium",
        category: planData.topic,
        description: auditedP2.description,
        type: auditedP2.type || "CODING",
        pattern: auditedP2.pattern,
        testSets: auditedP2.testSets,
        blueprint: auditedP2.blueprint,
        referenceSolution: auditedP2.referenceSolution,
        initialSchema: auditedP2.initialSchema,
        initialData: auditedP2.initialData,
        isVerified: false,
        source: "AI_GENERATED",
        creatorId: userId,
        isPublic: false,
      }
    });

    // Link them
    await prisma.studyPlanProblem.createMany({
      data: [
        { studyPlanId: createdPlan.id, problemId: p1.id, order: 1 },
        { studyPlanId: createdPlan.id, problemId: p2.id, order: 2 },
      ]
    });

    return NextResponse.json({ success: true, plan: createdPlan });

  } catch (error: any) {
    console.error("Study Plan Gen Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
