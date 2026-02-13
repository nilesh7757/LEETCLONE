import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput } from "@/lib/codeExecution";
import { ProblemType, Prisma } from "@prisma/client";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

interface InputCase {
  input: string;
  output: string;
}

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  // Verify ownership or admin
  const problem = await prisma.problem.findUnique({ where: { slug } });
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

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
    problemType,
    initialSchema,
    initialData,
  } = await req.json();

  // Re-generate test cases if provided (ONLY FOR CODING)
  let newTestSets: string | undefined = undefined;
  
  if (problemType === "CODING" && examplesInput && testCasesInput && referenceSolution) {
      
      const processedExamples: TestInputOutput[] = examplesInput.map((ex: InputCase) => ({ 
          input: ex.input, 
          expectedOutput: ex.output 
      }));

      const processedTestCases: TestInputOutput[] = [];
      
      if (testCasesInput.length > 0) {
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
                  throw new ApiError(`Reference solution failed on hidden test case. Input: ${res.input}. Error: ${res.error}`, 400);
              }
          }
      }

      newTestSets = JSON.stringify({
          examples: processedExamples,
          hidden: processedTestCases
      });
  } else if (problemType === "SQL" || problemType === "SYSTEM_DESIGN") {
      // For SQL/System Design, we just store what's given without re-running code
      newTestSets = JSON.stringify({
          examples: examplesInput ? examplesInput.map((ex: InputCase) => ({ input: ex.input, expectedOutput: ex.output })) : [],
          hidden: testCasesInput ? testCasesInput.map((tc: InputCase) => ({ input: tc.input, expectedOutput: tc.output || "" })) : []
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
      initialSchema,
      initialData,
      type: problemType as ProblemType,
      testSets: (newTestSets || problem.testSets) as unknown as Prisma.InputJsonValue 
    }
  });

  return NextResponse.json({ problem: updatedProblem });
});
