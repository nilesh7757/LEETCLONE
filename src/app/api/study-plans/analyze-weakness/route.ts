import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { runAI, AIError } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

interface TopicStats {
  solved: number;
  total: number;
}

interface ProblemStatus {
  solved: boolean;
  category: string;
}

export const GET = apiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const studyPlanId = searchParams.get("studyPlanId");
  
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const userId = session.user.id;
  let planDetails = null;

  // Fetch user's submissions
  let submissions;
  
  if (studyPlanId) {
     // Focus on problems within THIS study plan
     const plan = await prisma.studyPlan.findUnique({
        where: { id: studyPlanId },
        include: {
          problems: {
            include: {
              problem: { select: { category: true, pattern: true, title: true } }
            }
          }
        }
     });

     if (!plan) throw new ApiError("Plan not found", 404);
     planDetails = {
        title: plan.title,
        description: plan.description,
        topics: Array.from(new Set(plan.problems.map(p => p.problem.pattern || p.problem.category)))
     };

     const problemIds = plan.problems.map(p => p.problemId);
     
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
    if (studyPlanId && planDetails) {
      return NextResponse.json({ 
        weakness: "Getting Started", 
        analysis: `Welcome to the "${planDetails.title}" study plan! You haven't started yet. This plan covers ${planDetails.topics.join(", ")}. We recommend tackling the first problem to get your journey started!`,
        recommendedTopic: planDetails.topics[0] || "Arrays" 
      });
    }
    return NextResponse.json({ 
      weakness: "Starting Out", 
      analysis: "You haven't solved any problems yet! Let's build your foundation. We recommend starting with a personalized roadmap to guide your learning.",
      recommendedTopic: "Arrays" 
    });
  }

  // Summarize progress by UNIQUE problems
  const stats: Record<string, TopicStats> = {};
  const problemStatusMap: Record<string, ProblemStatus> = {}; // problemId -> { solved: boolean, category: string }

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

  Object.values(problemStatusMap).forEach((p: ProblemStatus) => {
    if (!stats[p.category]) stats[p.category] = { solved: 0, total: 0 };
    stats[p.category].total++;
    if (p.solved) stats[p.category].solved++;
  });

  const systemPrompt = `You are a technical mentor. Based on user stats, identify their biggest weakness. 
  ${planDetails ? `The user is currently in a study plan called "${planDetails.title}" which focuses on: ${planDetails.topics.join(", ")}.` : ""}
  Return ONLY JSON: { "weakness": "Topic Name", "analysis": "Detailed explanation", "recommendedTopic": "Topic Name" }`;

  const userPrompt = `Identify my biggest weakness based on these stats: ${JSON.stringify(stats)}. ${planDetails ? "Focus your advice on my progress within this study plan." : ""}`;

  logger.info("Analyzing weakness for stats:", JSON.stringify(stats));

  try {
    const response = await runAI(userPrompt, systemPrompt, true);
    const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: unknown) {
    logger.error("AI Analysis failed:", error instanceof Error ? error.message : String(error));
    if (error instanceof AIError && error.status === 429) {
      throw error;
    }
    
    // Fallback
    return NextResponse.json({
      weakness: "Mixed Patterns",
      analysis: "You've been solving various problems. Solve more to get a detailed AI analysis!",
      recommendedTopic: Object.keys(stats)[0] || "Dynamic Programming"
    });
  }
});