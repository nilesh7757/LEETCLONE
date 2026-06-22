import { NextResponse } from "next/server";
import { TestInputOutput } from "@/lib/codeExecution";
import { ProblemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { executionQueue, queueEvents } from "@/lib/queue";
import { detectLanguage } from "@/lib/utils";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { 
    language, 
    code, 
    problemId,
    type, 
    initialSchema,
    initialData,
    timeLimit,
    memoryLimit,
    testCases,
  } = await req.json();

  if (!code) {
    throw new ApiError("Missing code", 400);
  }

  let problem = null;
  if (problemId) {
    problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        type: true,
        timeLimit: true,
        memoryLimit: true,
        initialSchema: true,
        initialData: true,
        testSets: true,
        referenceSolution: true,
      },
    });
  }

  const finalType = (problem?.type || type || "CODING") as ProblemType;

  // Determine test cases to run
  let finalTestCases: TestInputOutput[] = [];

  if (testCases && Array.isArray(testCases) && testCases.length > 0) {
    finalTestCases = testCases;
  } else if (problem) {
    let allTestSets: TestInputOutput[] = [];
    if (Array.isArray(problem.testSets)) {
      allTestSets = problem.testSets as unknown as TestInputOutput[];
    }
    finalTestCases = allTestSets.filter(tc => tc.isExample === true);
  } 

  // DYNAMIC EXPECTED OUTPUT GENERATION
  const generationCode = code || problem?.referenceSolution;
  const casesToGenerate = finalTestCases.filter(tc => !tc.expectedOutput || String(tc.expectedOutput).trim() === "");
  
  if (casesToGenerate.length > 0 && generationCode && finalType === "CODING") {
    const refLang = language || detectLanguage(generationCode);
    const refJob = await executionQueue.add('generate-outputs', {
      problemId: problemId || "ref-generator",
      type: "CODING" as ProblemType,
      code: generationCode,
      language: refLang,
      testCases: casesToGenerate.map(tc => ({ 
        input: typeof tc === 'string' ? tc : (tc.input || ""), 
        expectedOutput: "" 
      })),
      timeLimit: problem?.timeLimit || 2,
      memoryLimit: problem?.memoryLimit || 256,
      isOutputGeneration: true
    });

    const refResults = await refJob.waitUntilFinished(queueEvents, 30000);

    casesToGenerate.forEach((tc, idx) => {
      const res = refResults[idx];
      if (res && res.status === "Accepted") {
        tc.expectedOutput = res.actual;
      }
    });
  }
  
  const commonParams = {
    problemId: problemId || "new-problem",
    type: finalType,
    code,
    testCases: finalTestCases,
    timeLimit: problem?.timeLimit || timeLimit || 2,
    memoryLimit: problem?.memoryLimit || memoryLimit || 256,
    initialSchema: (problem?.initialSchema || initialSchema) ?? undefined,
    initialData: (problem?.initialData || initialData) ?? undefined,
  };

  let finalLanguage = language;
  if (finalType === "CODING") {
    finalLanguage = language || detectLanguage(code) || "javascript";
  } else if (finalType === "SQL") {
    finalLanguage = "sql";
  }

  const job = await executionQueue.add('run-code', { 
    ...commonParams, 
    language: finalLanguage 
  });

  const results = await job.waitUntilFinished(queueEvents, 30000); // 30 seconds timeout
  
  return NextResponse.json({ results });
});
