import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput } from "@/lib/codeExecution";

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
      editorial // Added
    } = await req.json();

    // Re-generate test cases if provided
    let newTestSets = undefined;
    
    // Only re-generate if inputs are provided. 
    // If user is just updating description, we might not want to re-run everything unless they send the test cases back.
    // Assuming the frontend sends everything back for simplicity.
    if (examplesInput && testCasesInput && referenceSolution) {
        
        const processedExamples: TestInputOutput[] = examplesInput.map((ex: any) => ({ 
            input: ex.input, 
            expectedOutput: ex.output 
        }));

        const processedTestCases: TestInputOutput[] = [];
        // Only run execution for hidden cases if we need to generate outputs
        // If outputs are already provided in the request (editing existing hidden cases?), we might trust them or re-run.
        // For safety and consistency, let's re-run the reference solution to ensure outputs match logic.
        
        // Note: This might be slow.
        if (testCasesInput.length > 0) {
            try {
                const testCaseResults = await executeCode(
                    language,
                    referenceSolution,
                    testCasesInput.map((tc: { input: string }) => ({ input: tc.input, expectedOutput: "" })),
                    timeLimit,
                    memoryLimit,
                    true
                );

                for (const res of testCaseResults) {
                    if (res.status !== "Runtime Error" && res.status !== "Time Limit Exceeded") {
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
        editorial, // Update editorial
        testSets: (newTestSets || problem.testSets) as any // Keep old if not updating
      }
    });

    return NextResponse.json({ problem: updatedProblem });

  } catch (error: any) {
    console.error("Error updating problem:", error);
    return NextResponse.json({ error: error.message || "Failed to update problem" }, { status: 500 });
  }
}
