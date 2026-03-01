import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput, ExecutionResult } from "@/lib/codeExecution";
import { auditAndAnalyze, evaluateSystemDesign } from "@/lib/gemini";
import { socketClient } from "@/lib/socket-client";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { updateUserStreak } from "@/lib/services/streak";
import { processContestScoring } from "@/lib/services/contest";

// Ensure socket is connected
socketClient.connect();

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) {
    throw new ApiError("Problem ID is required", 400);
  }

  const submissions = await prisma.submission.findMany({
    where: {
      problemId,
      userId: session.user.id,
    },
    select: {
      id: true,
      code: true,
      language: true,
      status: true,
      score: true,
      runtime: true,
      timeComplexity: true,
      spaceComplexity: true,
      auditPassed: true,
      auditFeedback: true,
      createdAt: true,
      problemId: true,
      userId: true,
      testCaseResults: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ submissions });
});

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new ApiError("Unauthorized", 401);
  }
  const userId = session.user.id;

  const { code, language, problemId, type } = await req.json();
  logger.info(`[SUBMISSION] Start Submission for: ${problemId}, type: ${type}`);

  // 1. Fetch the problem
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: {
      id: true,
      title: true,
      difficulty: true,
      description: true,
      timeLimit: true,
      memoryLimit: true,
      testSets: true,
      initialSchema: true,
      initialData: true,
      type: true,
    },
  });

  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  // Parse Test Cases
  let combinedTestCases: TestInputOutput[] = [];
  let rawTestSets = problem.testSets;

  if (typeof rawTestSets === 'string') {
    try {
      rawTestSets = JSON.parse(rawTestSets);
    } catch (e) {
      logger.error("Failed to parse testSets string", e instanceof Error ? e.message : String(e));
    }
  }

  if (Array.isArray(rawTestSets)) {
    combinedTestCases = rawTestSets as unknown as TestInputOutput[];
  } else if (rawTestSets && typeof rawTestSets === 'object' && 'examples' in (rawTestSets as Record<string, unknown>)) {
    const sets = rawTestSets as unknown as { examples: TestInputOutput[]; hidden: TestInputOutput[] };
    combinedTestCases = [...(sets.examples || []), ...(sets.hidden || [])];
  }

  // 2. Execute Code
  let results: ExecutionResult[] = [];
  let designScore: number | null = null;

  if (problem.type === "CODING") {
    results = await executeCode({
      problemId: problem.id,
      code,
      language,
      type: "CODING",
      testCases: combinedTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput
      })),
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit
    });
  } else if (problem.type === "SQL") {
    results = await executeCode({
      problemId: problem.id,
      code,
      language: "sql",
      type: "SQL",
      testCases: combinedTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput
      })),
      initialSchema: problem.initialSchema || "",
      initialData: problem.initialData || ""
    });
  } else if (problem.type === "SYSTEM_DESIGN") {
    const evalResult = await evaluateSystemDesign(
      `Title: ${problem.title}\nDescription: ${problem.description}`,
      code
    );
    designScore = evalResult.score;
    results = [{
      input: "System Design Answer",
      expected: "N/A",
      actual: evalResult.feedback,
      status: "Accepted"
    }] as unknown as ExecutionResult[];
  } else if (problem.type === "READING") {
    results = [{
      input: "Reading Completed",
      expected: "N/A",
      actual: "The user has completed the study guide.",
      status: "Accepted"
    }] as unknown as ExecutionResult[];
  } else {
    throw new ApiError(`Unsupported problem type for submission: ${problem.type}`, 400);
  }

  // Determine overall status
  let maxRuntime = 0;
  let firstFailingResult: ExecutionResult | null = null;
  let overallStatus = "Accepted";

  if (Array.isArray(results)) {
    for (const res of results) {
      if (typeof res.runtime === 'number' && !isNaN(res.runtime)) {
        if (res.runtime > maxRuntime) maxRuntime = res.runtime;
      }
      if (res.status !== "Accepted" && overallStatus === "Accepted") {
        overallStatus = res.status;
        firstFailingResult = res;
      }
    }
  }

  // AI Audit
  let auditPassed = true;
  let auditFeedback = "No issues found.";
  let geminiTimeComplexity = "N/A";
  let geminiSpaceComplexity = "N/A";
  
  if (problem.type === "CODING" && overallStatus === "Accepted") {
    try {
      const analysis = await auditAndAnalyze(code, language, problem.title, problem.description);
      auditPassed = analysis.passed;
      auditFeedback = analysis.feedback;
      geminiTimeComplexity = analysis.timeComplexity;
      geminiSpaceComplexity = analysis.spaceComplexity;
    } catch (e) {
      logger.error("AI Analysis failed", e instanceof Error ? e.message : String(e));
    }
  }

  // 3. Save Submission and Update User Stats (Transactional)
  const finalSubmission = await prisma.$transaction(async (tx) => {
    const sub = await tx.submission.create({
      data: {
        code,
        language: problem.type === "SQL" ? "sql" : (problem.type === "SYSTEM_DESIGN" ? "markdown" : language), 
        status: overallStatus,
        score: designScore,
        runtime: maxRuntime, 
        timeComplexity: geminiTimeComplexity,
        spaceComplexity: geminiSpaceComplexity,
        auditPassed, 
        auditFeedback, 
        problemId,
        userId: userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        testCaseResults: results ? (results as any) : [],
      },
    });

    if (overallStatus === "Accepted") {
      const previousAccepted = await tx.submission.count({
        where: {
          userId: userId,
          problemId,
          status: "Accepted",
          id: { not: sub.id }
        }
      });

      if (previousAccepted === 0) {
        await tx.user.update({
          where: { id: userId },
          data: { solvedCount: { increment: 1 } }
        });
      }
    }
    return sub;
  });

  // 4. Update Streak and Contest Scoring (Async)
  let updatedStreak = 0;
  if (overallStatus === "Accepted") {
    try {
      updatedStreak = await updateUserStreak(userId);
      await processContestScoring(userId, problemId, problem.difficulty, finalSubmission.id);
    } catch (err) {
      logger.error("[SUBMISSION] Post-processing failed", err);
    }
  }

  return NextResponse.json({ 
    submission: finalSubmission,
    newStreak: updatedStreak,
    failedTestCase: firstFailingResult ? {
      input: firstFailingResult.input,
      output: firstFailingResult.actual,
      expected: firstFailingResult.expected
    } : null
  });
});
