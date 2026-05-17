import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { runAI } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { ProblemType, Prisma } from "@prisma/client";
import { generateSlug } from "@/lib/utils";

interface TopicStats {
  solved: number;
  failed: number;
  total: number;
}

interface GeneratedAIProblem {
  title: string;
  type: string;
  difficulty: string;
  description: string;
  pattern: string;
  testSets: unknown;
  blueprint: unknown;
  referenceSolution: string;
  initialSchema?: string;
  initialData?: string;
}

interface AITestCase {
  input?: string;
  expectedOutput?: string;
  output?: string;
  isExample?: boolean;
}

interface GeneratedPlanData {
  topic: string;
  title: string;
  description: string;
  problem1: GeneratedAIProblem;
  problem2: GeneratedAIProblem;
}

export const POST = apiHandler(async (req: Request) => {
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

    const stats: Record<string, TopicStats> = {};
    submissions.forEach(sub => {
      const cat = sub.problem.pattern || sub.problem.category;
      if (!stats[cat]) stats[cat] = { solved: 0, failed: 0, total: 0 };
      stats[cat].total++;
      if (sub.status === "Accepted") stats[cat].solved++;
      else stats[cat].failed++;
    });
    statsData = Object.keys(stats).length > 0 
      ? `User Stats: ${JSON.stringify(stats)}`
      : "User has not solved any problems yet. Suggest a foundational topic like Arrays, Strings, or Basic Algorithms.";
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
      "testSets": { 
        "examples": [{"input": "...", "expectedOutput": "..."}], 
        "hidden": [{"input": "...", "expectedOutput": "..."}] 
      }, 
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
      "testSets": { 
        "examples": [{"input": "...", "expectedOutput": "..."}], 
        "hidden": [{"input": "...", "expectedOutput": "..."}] 
      }, 
      "blueprint": [...],
      "referenceSolution": "...",
      "initialSchema": "...", 
      "initialData": "..."
    }
  }
  
  CRITICAL: Use "READING" for theoretical or complex topics (ML, DevOps, etc.) where a documentation guide is more appropriate than a practice problem. For READING, provide a very detailed "description" with study materials.`;

  const userPrompt = customRequest ? `Create a plan for: ${customRequest}` : "Create a custom 2-day study plan based on my stats.";
  const planData = await runAI(userPrompt, systemPrompt, true) as GeneratedPlanData;

  const formatTestSets = (testSets: unknown) => {
    const formatted: { examples: { input: string; expectedOutput: string }[], hidden: { input: string; expectedOutput: string }[] } = { examples: [], hidden: [] };
    if (!testSets) return formatted;
    
    if (Array.isArray(testSets)) {
      testSets.forEach((ts: AITestCase) => {
        const item = {
          input: ts.input || "",
          expectedOutput: ts.expectedOutput || ts.output || ""
        };
        if (ts.isExample === true) {
          formatted.examples.push(item);
        } else {
          formatted.hidden.push(item);
        }
      });

      // Fallback: If no isExample flags were found, put all in examples
      if (formatted.examples.length === 0 && formatted.hidden.length > 0) {
         formatted.examples = formatted.hidden;
         formatted.hidden = [];
      }
    } else if (typeof testSets === 'object' && testSets !== null) {
      const ts = testSets as { examples?: AITestCase[]; hidden?: AITestCase[] };
      formatted.examples = (ts.examples || []).map((t: AITestCase) => ({
        input: t.input || "",
        expectedOutput: t.expectedOutput || t.output || ""
      }));
      formatted.hidden = (ts.hidden || []).map((t: AITestCase) => ({
        input: t.input || "",
        expectedOutput: t.expectedOutput || t.output || ""
      }));
    }
    return formatted;
  };


    // --- AUDITOR PHASE: Fix hallucinations before saving ---
  const auditProblem = async (prob: GeneratedAIProblem): Promise<GeneratedAIProblem> => {
    logger.info(`[AI Auditor] Auditing: ${prob.title}`);
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
      const audited = await runAI(auditPrompt, "You are a precise JSON auditor.", true) as GeneratedAIProblem;
      return audited;
    } catch (e) {
      logger.error("Audit failed, using original problem", e instanceof Error ? e.message : String(e));
      return prob;
    }
  };

  logger.info("[AI] Starting deep audit of generated problems...");
  const auditedP1 = await auditProblem(planData.problem1);
  const auditedP2 = await auditProblem(planData.problem2);

  // 3. Save the Study Plan and AI Problems to DB
  const createdPlan = await prisma.studyPlan.create({
    data: {
      title: planData.title,
      slug: generateSlug(planData.title) + "-" + Date.now(),
      description: planData.description,
      isOfficial: false,
      isPublic: false,
      creatorId: userId,
      durationDays: 2,
    }
  });

  const saveProblem = async (audited: GeneratedAIProblem, difficulty: string) => {
    return await prisma.problem.create({
      data: {
        title: audited.title,
        slug: generateSlug(audited.title) + "-" + Date.now(),
        difficulty: audited.difficulty || difficulty,
        category: planData.topic,
        description: audited.description,
        type: audited.type as ProblemType || "CODING",
        pattern: audited.pattern,
        testSets: JSON.stringify(formatTestSets(audited.testSets)),
        blueprint: audited.blueprint as Prisma.InputJsonValue,
        referenceSolution: audited.referenceSolution,
        initialSchema: audited.initialSchema,
        initialData: audited.initialData,
        isVerified: false,
        source: "AI_GENERATED",
        creatorId: userId,
        isPublic: false,
      }
    });
  };

  const p1 = await saveProblem(auditedP1, "Easy");
  const p2 = await saveProblem(auditedP2, "Medium");

  // Link them
  await prisma.studyPlanProblem.createMany({
    data: [
      { studyPlanId: createdPlan.id, problemId: p1.id, order: 1 },
      { studyPlanId: createdPlan.id, problemId: p2.id, order: 2 },
    ]
  });

  return NextResponse.json({ success: true, plan: createdPlan });
});
