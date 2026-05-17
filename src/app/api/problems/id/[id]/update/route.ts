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

export const PATCH = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  // Verify ownership or admin
  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  const body = await req.json();
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
    isVerified,
    hints
  } = body;

  // Re-generate test cases if provided (ONLY FOR CODING)
  let newTestSets: string | undefined = undefined;
  
  if (problemType === "CODING" && Array.isArray(examplesInput) && Array.isArray(testCasesInput) && referenceSolution) {
      
      const processedExamples: TestInputOutput[] = examplesInput.map((ex: InputCase) => ({ 
          input: ex.input, 
          expectedOutput: ex.output 
      }));

      const processedTestCases: TestInputOutput[] = [];
      
      if (testCasesInput.length > 0) {
          const testCaseResults = await executeCode({
              problemId: id,
              type: "CODING",
              language,
              code: referenceSolution,
              testCases: testCasesInput.map((tc: string | { input: string }) => ({ 
                  input: typeof tc === 'string' ? tc : (tc.input || ""), 
                  expectedOutput: "" 
              })),
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
      newTestSets = JSON.stringify({
          examples: Array.isArray(examplesInput) ? examplesInput.map((ex: InputCase) => ({ input: ex.input, expectedOutput: ex.output })) : [],
          hidden: Array.isArray(testCasesInput) ? testCasesInput.map((tc: InputCase) => ({ input: tc.input, expectedOutput: tc.output || "" })) : []
      });
  }

  const updatedProblem = await prisma.problem.update({
    where: { id },
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
      isVerified,
      hints,
      type: problemType as ProblemType,
      testSets: (newTestSets || problem.testSets) as unknown as Prisma.InputJsonValue 
    }
  });

  return NextResponse.json({ problem: updatedProblem });
});
