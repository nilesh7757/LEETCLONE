import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { runAI, AIError } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { feedback } = await req.json();
  if (!feedback) throw new ApiError("Feedback is required", 400);

  const problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (!problem) throw new ApiError("Problem not found", 404);

  const systemPrompt = `
    You are a Coding Problem Refiner. 
    You will receive a current problem definition and user feedback.
    Your task is to improve the problem according to the feedback.
    
    Return ONLY the updated JSON object with:
    - title
    - description (HTML)
    - difficulty
    - category
    - pattern
    - testSets: An array of objects with structure: { "input": "string", "expectedOutput": "string", "isExample": boolean, "explanation": "string" }
    - blueprint: An array of 3 MCQs
    - referenceSolution
    
    CRITICAL: 
    1. Use "expectedOutput" as the key, NOT "expected".
    2. Provide exactly 1-2 examples (isExample: true).
    3. Provide at least 5-10 additional hidden cases (isExample: false).
  `;

  const userPrompt = `
    CURRENT PROBLEM:
    ${JSON.stringify(problem)}
    
    USER FEEDBACK:
    ${feedback}
    
    Please refine the problem based on this feedback.
  `;

  try {
    const responseText = await runAI(userPrompt, systemPrompt, true);
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const updatedData = JSON.parse(cleanJson);

    const updatedProblem = await prisma.problem.update({
      where: { id: problem.id },
      data: {
        title: updatedData.title,
        description: updatedData.description,
        difficulty: updatedData.difficulty,
        category: updatedData.category,
        pattern: updatedData.pattern,
        testSets: updatedData.testSets,
        blueprint: updatedData.blueprint,
        referenceSolution: updatedData.referenceSolution,
        lastAiFeedback: feedback,
        isVerified: false, 
      }
    });

    return NextResponse.json({ success: true, problem: updatedProblem });
  } catch (error: unknown) {
    if (error instanceof AIError && error.status === 429) {
      throw error;
    }
    logger.error("Improvement Error:", error instanceof Error ? error.message : String(error));
    throw new ApiError("Internal Server Error", 500);
  }
});
