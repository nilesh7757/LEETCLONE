import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput } from "@/lib/codeExecution";
import { ProblemType } from "@prisma/client";

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership or admin
  const problem = await prisma.problem.findUnique({ where: { slug } });
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const {
      title,
      difficulty,
      category,
      description,
      examplesInput,
      testCasesInput,
      referenceSolution,
      language,
      timeLimit,
      memoryLimit,
      isPublic,
      editorial,
      problemType, // New
    } = await req.json();

    // Re-generate test cases if provided (ONLY FOR CODING)
    let newTestSets = undefined;
    
    if (problemType === "CODING" && examplesInput && testCasesInput && referenceSolution) {
        
        const processedExamples: TestInputOutput[] = examplesInput.map((ex: any) => ({ 
            input: ex.input, 
            expectedOutput: ex.output 
        }));

        const processedTestCases: TestInputOutput[] = [];
        
        if (testCasesInput.length > 0) {
            try {
                // Fixed: executeCode signature
                const testCaseResults = await executeCode({
                    problemId: "temp-update",
                    type: "CODING",
                    language,
                    code: referenceSolution,
                    testCases: testCasesInput.map((tc: { input: string }) => ({ input: tc.input, expectedOutput: "" })),
                    timeLimit,
                    memoryLimit,
                    isOutputGeneration: true
                });

                for (const res of testCaseResults) {
                    if (res.status !== "Runtime Error" && res.status !== "Time Limit Exceeded" && res.status !== "Memory Limit Exceeded") {
                        processedTestCases.push({ input: res.input, expectedOutput: res.actual });
                    } else {
                        return NextResponse.json({ 
                            error: `Reference solution failed on hidden test case. Input: ${res.input}. Error: ${res.error}` 
                        }, { status: 400 });
                    }
                }
            } catch (execError: any) {
                 return NextResponse.json({ error: `Execution service failed: ${execError.message}` }, { status: 500 });
            }
        }

        newTestSets = JSON.stringify({
            examples: processedExamples,
            hidden: processedTestCases
        });
    }

    const updatedProblem = await prisma.problem.update({
      where: { slug },
      data: {
        title,
        difficulty,
        category,
        description,
        timeLimit,
        memoryLimit,
        isPublic,
        referenceSolution,
        editorial,
        type: problemType as ProblemType,
        testSets: (newTestSets || problem.testSets) as any 
      }
    });

    return NextResponse.json({ problem: updatedProblem });

  } catch (error: any) {
    console.error("Error updating problem:", error);
    return NextResponse.json({ error: error.message || "Failed to update problem" }, { status: 500 });
  }
}
