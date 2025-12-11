import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput } from "@/lib/codeExecution"; // Import TestInputOutput

export async function POST(req: Request) {
  const session = await auth();
  console.log("Session in /api/problems/create:", JSON.stringify(session, null, 2));

  if (!session || !session.user || !session.user.id) {
    console.error("Unauthorized access attempt: No session or user ID.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      slug,
      difficulty,
      category,
      description,
      examplesInput, // Array of {input: string, output: string} for examples
      testCasesInput, // Array of {input: string} for hidden test cases
      referenceSolution,
      language,
      timeLimit,
      memoryLimit,
      isPublic, // New field
      contestId, // Optional contest ID
      // starterCode, // Removed
    } = await req.json();

    if (
      !title ||
      !slug ||
      !difficulty ||
      !category ||
      !description ||
      !referenceSolution ||
      !language ||
      !examplesInput ||
      !testCasesInput ||
      timeLimit === undefined || // Updated validation
      memoryLimit === undefined // Updated validation
    ) {
      return NextResponse.json({ error: "Missing required problem fields" }, { status: 400 });
    }

    // Check if problem with same slug already exists
    const existingProblem = await prisma.problem.findUnique({
      where: { slug },
    });
    if (existingProblem) {
      return NextResponse.json({ error: `Problem with slug '${slug}' already exists` }, { status: 409 });
    }

    // Verify contest ownership if contestId is provided
    if (contestId) {
      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        select: { creatorId: true },
      });

      if (!contest) {
        return NextResponse.json({ error: "Contest not found" }, { status: 404 });
      }

      if (contest.creatorId !== session.user.id) {
          // Check for ADMIN role if implemented
          const user = await prisma.user.findUnique({ where: { id: session.user.id } });
          if (user?.role !== "ADMIN") {
             return NextResponse.json({ error: "You are not authorized to add problems to this contest" }, { status: 403 });
          }
      }
    }

    // 1. Examples are now sent with both input and expectedOutput from the frontend
    const processedExamples: TestInputOutput[] = examplesInput.map((ex: any) => ({ input: ex.input, expectedOutput: ex.output }));

    // 2. Generate outputs for hidden test cases using the reference solution
    const processedTestCases: TestInputOutput[] = [];
    if (testCasesInput && testCasesInput.length > 0) {
      let testCaseResults;
      try {
        testCaseResults = await executeCode(
          language,
          referenceSolution,
          testCasesInput.map((tc: { input: string }) => ({ input: tc.input, expectedOutput: "" })), // Dummy expectedOutput still needed for type
          timeLimit, // Pass timeLimit
          memoryLimit, // Pass memoryLimit
          true // isOutputGeneration: true
        );
      } catch (execError: any) {
        console.error("Execution failed completely:", execError);
        return NextResponse.json({ error: `Execution service failed: ${execError.message}` }, { status: 500 });
      }

      for (const res of testCaseResults) {
        if (res.status !== "Runtime Error" && res.status !== "Time Limit Exceeded" && res.status !== "Memory Limit Exceeded") {
          processedTestCases.push({ input: res.input, expectedOutput: res.actual });
        } else {
          console.error("Reference solution failed to execute on hidden test input:", res.input, "Error:", res.error);
          return NextResponse.json({ 
            error: `Reference solution failed on hidden test case. Input: ${res.input}. Error: ${res.error || res.status}` 
          }, { status: 400 });
        }
      }
    }

    const newProblem = await prisma.problem.create({
      data: {
        title,
        slug,
        difficulty,
        category,
        description,
        timeLimit,
        memoryLimit,
        isPublic: isPublic !== undefined ? isPublic : false, // Default to false if not provided
        testSets: JSON.stringify({
          examples: processedExamples,
          hidden: processedTestCases,
        }),
        referenceSolution,
        creatorId: session.user.id, // Link to creator
        contests: contestId ? {
          connect: { id: contestId }
        } : undefined,
      },
    });

    return NextResponse.json({ problem: newProblem }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create problem" },
      { status: 500 }
    );
  }
}
