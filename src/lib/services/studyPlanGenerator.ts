import { prisma } from "../prisma";
import { runAI } from "../gemini";
import { z } from "zod";
import { logger } from "../logger";

const GenerationSchema = z.object({
  title: z.string(),
  description: z.string(),
  problemSlugs: z.array(z.string()),
  reasoning: z.string()
});

/**
 * AI-Driven Personalized Study Plan Generator
 */
export async function generatePersonalizedStudyPlan(userId: string) {
  try {
    // 1. Fetch user's recent failures (Last 20 non-Accepted submissions)
    const failures = await prisma.submission.findMany({
      where: { 
        userId, 
        NOT: { status: "Accepted" } 
      },
      include: { problem: true },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    if (failures.length < 3) {
      return { error: "Not enough failure data yet. Solve more problems!" };
    }

    // 2. Fetch all available problems for the AI to pick from
    const availableProblems = await prisma.problem.findMany({
      where: { isPublic: true },
      select: { slug: true, title: true, category: true, difficulty: true },
      take: 100 // Limit for AI context
    });

    const failureSummary = failures.map(f => `${f.problem.title} (${f.status})`).join(", ");
    const problemsList = availableProblems.map(p => `${p.title} [${p.slug}]`).join(", ");

    const prompt = `
      User ${userId} has been struggling with these problems: ${failureSummary}.
      Identify the core weakness (e.g. Recursion, DP, Graphs).
      Choose 5 problems from this list to help them improve: ${problemsList}.
      
      Return JSON:
      {
        "title": "Bootcamp: [Weakness Name]",
        "description": "Personalized plan because you struggled with ${failureSummary}",
        "problemSlugs": ["slug1", "slug2", "slug3", "slug4", "slug5"],
        "reasoning": "Why these problems?"
      }
    `;

    const planData = await runAI(prompt, "You are a personalized curriculum designer.", GenerationSchema) as z.infer<typeof GenerationSchema>;

    // 3. Create the Study Plan in Database
    const newPlan = await prisma.studyPlan.create({
      data: {
        title: planData.title,
        slug: `personal-${userId}-${Date.now()}`,
        description: `${planData.description}\n\nAI Reasoning: ${planData.reasoning}`,
        creatorId: userId,
        isPublic: false,
        problems: {
          create: planData.problemSlugs.map((slug, index) => ({
            problem: { connect: { slug } },
            order: index
          }))
        },
        enrollments: {
          create: { userId }
        }
      }
    });

    logger.info(`[STUDY_PLAN] Generated personal plan for user: ${userId}`);
    return newPlan;

  } catch (error) {
    logger.error("[STUDY_PLAN_GENERATION_ERROR]", error);
    throw error;
  }
}
