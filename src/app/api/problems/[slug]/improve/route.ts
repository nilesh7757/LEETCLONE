import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { runAI, AIError } from "@/lib/gemini";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { feedback } = await req.json();
    if (!feedback) return NextResponse.json({ error: "Feedback is required" }, { status: 400 });

    const problem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

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

  } catch (error: any) {
    console.error("Improvement Error:", error);
    if (error instanceof AIError && error.status === 429) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
