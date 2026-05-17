import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput } from "@/lib/codeExecution";
import { ProblemType } from "@prisma/client";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

interface InputCase {
  input: string;
  output: string;
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  logger.debug("Session in /api/problems/create:", JSON.stringify(session, null, 2));

  if (!session || !session.user || !session.user.id) {
    logger.error("Unauthorized access attempt: No session or user ID.");
    throw new ApiError("Unauthorized", 401);
  }

  const {
    title,
    slug,
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
    contestId,
    editorial,
    problemType,
    initialSchema,
    initialData,
  } = await req.json();

  const isDraft = !isPublic && (req.headers.get("x-source") === "FOUNDRY" || true); // Assuming private for now

  if (
    !title ||
    !slug ||
    !difficulty ||
    !category ||
    !description ||
    !problemType ||
    timeLimit === undefined || 
    memoryLimit === undefined
  ) {
    throw new ApiError("Missing required metadata fields", 400);
  }

  // Only require implementation details if it's NOT a draft/private foundry unit
  if (!isDraft && problemType === "CODING" && (!referenceSolution || !language || !Array.isArray(examplesInput) || !Array.isArray(testCasesInput))) {
     throw new ApiError("Implementation details required for public units", 400);
  }

  // Check if problem with same slug already exists
  const existingProblem = await prisma.problem.findUnique({
    where: { slug },
  });
  if (existingProblem) {
    throw new ApiError(`Problem with slug '${slug}' already exists`, 409);
  }

  // Verify contest ownership if contestId is provided
  if (contestId) {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      select: { creatorId: true },
    });

    if (!contest) {
      throw new ApiError("Contest not found", 404);
    }

    if (contest.creatorId !== session.user.id) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.role !== "ADMIN") {
           throw new ApiError("You are not authorized to add problems to this contest", 403);
        }
    }
  }

  // 1. Examples
  const processedExamples: TestInputOutput[] = Array.isArray(examplesInput) ? examplesInput.map((ex: InputCase) => ({ input: ex.input, expectedOutput: ex.output })) : [];

  // 2. Generate outputs for hidden test cases (Only for CODING)
  const processedTestCases: TestInputOutput[] = [];
  
  if (problemType === "CODING" && Array.isArray(testCasesInput) && testCasesInput.length > 0) {
    /**
     * ROBUST LANGUAGE DETECTOR (Internal)
     */
    const detectLanguage = (src: string): string => {
      const clean = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim(); 
      if (clean.includes("#include") || clean.includes("using namespace std;")) return "cpp";
      if ((clean.includes("def ") && !clean.includes("function ")) || (clean.includes("import ") && !clean.includes("from '"))) return "python";
      if (clean.includes("public class ") && clean.includes("static void main")) return "java";
      return "javascript";
    };

    const finalLang = language || detectLanguage(referenceSolution || "");

    const testCaseResults = await executeCode({
      problemId: "temp-create",
      type: "CODING",
      language: finalLang,
      code: referenceSolution,
      testCases: testCasesInput.map((tc: string | { input: string }) => ({ 
        input: typeof tc === 'string' ? tc : ((tc as { input: string }).input || ""), 
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
        logger.error(`Reference solution failed to execute on hidden test input: ${res.input}, Error: ${res.error}`);
        throw new ApiError(`Reference solution failed on hidden test case. Input: ${res.input}. Error: ${res.error || res.status}`, 400);
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
      isPublic: isPublic !== undefined ? isPublic : false,
      testSets: JSON.stringify({
        examples: processedExamples,
        hidden: processedTestCases, 
      }),
      referenceSolution,
      editorial,
      initialSchema,
      initialData,
      type: problemType as ProblemType,
      creatorId: session.user.id,
      contests: contestId ? {
        connect: { id: contestId }
      } : undefined,
    },
  });

  return NextResponse.json({ problem: newProblem }, { status: 201 });
});
