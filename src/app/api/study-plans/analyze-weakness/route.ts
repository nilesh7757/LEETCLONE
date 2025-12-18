import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { runAI, AIError } from "@/lib/gemini";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studyPlanId = searchParams.get("studyPlanId");
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's submissions
    let submissions;
    
    if (studyPlanId) {
       // Focus on problems within THIS study plan
       const planProblems = await prisma.studyPlanProblem.findMany({
          where: { studyPlanId },
          select: { problemId: true }
       });
       const problemIds = planProblems.map(p => p.problemId);
       
       submissions = await prisma.submission.findMany({
          where: { 
             userId,
             problemId: { in: problemIds }
          },
          include: {
            problem: {
              select: { category: true, pattern: true, difficulty: true }
            }
          }
       });
    } else {
       submissions = await prisma.submission.findMany({
          where: { userId },
          include: {
            problem: {
              select: { category: true, pattern: true, difficulty: true }
            }
          }
       });
    }

    if (submissions.length === 0) {
      return NextResponse.json({ 
        weakness: "No data yet", 
        message: "Solve some problems to get AI analysis!" 
      });
    }

    // Summarize progress by UNIQUE problems
    const stats: any = {};
    const problemStatusMap: any = {}; // problemId -> { solved: boolean, category: string }

    submissions.forEach(sub => {
      const pId = sub.problemId;
      const cat = sub.problem.pattern || sub.problem.category;
      
      if (!problemStatusMap[pId]) {
        problemStatusMap[pId] = { solved: false, category: cat };
      }
      if (sub.status === "Accepted") {
        problemStatusMap[pId].solved = true;
      }
    });

    Object.values(problemStatusMap).forEach((p: any) => {
      if (!stats[p.category]) stats[p.category] = { solved: 0, total: 0 };
      stats[p.category].total++;
      if (p.solved) stats[p.category].solved++;
    });

    const systemPrompt = `You are a technical mentor. Based on user stats, identify their biggest weakness. 
    Return ONLY JSON: { "weakness": "Topic Name", "analysis": "Detailed explanation", "recommendedTopic": "Topic Name" }`;

    const userPrompt = `Identify my biggest weakness based on these stats: ${JSON.stringify(stats)}`;

    console.log("Analyzing weakness for stats:", JSON.stringify(stats));

    try {
      const response = await runAI(userPrompt, systemPrompt, true);
      const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error("AI Analysis failed:", error);
      if (error instanceof AIError && error.status === 429) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
      
      // Fallback
      return NextResponse.json({
        weakness: "Mixed Patterns",
        analysis: "You've been solving various problems. Solve more to get a detailed AI analysis!",
        recommendedTopic: Object.keys(stats)[0] || "Dynamic Programming"
      });
    }

  } catch (error) {
    console.error("Weakness analysis error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}