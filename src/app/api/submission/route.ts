import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput, ExecutionResult } from "@/lib/codeExecution";
import { auditAndAnalyze, evaluateSystemDesign } from "@/lib/gemini";
import { socketClient } from "@/lib/socket-client";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

// Ensure socket is connected
socketClient.connect();
const socket = socketClient.socket;

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
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { code, language, problemId, type } = await req.json();
  logger.info(`[SUBMISSION] Start Submission for: ${problemId}, type: ${type}`);

  // 1. Fetch the problem
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      category: true,
      description: true,
      timeLimit: true,
      memoryLimit: true,
      testSets: true,
      referenceSolution: true,
      initialSchema: true,
      initialData: true,
      type: true,
      contests: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          creatorId: true,
          isOfficial: true,
        },
      },
    },
  });

  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

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
  } else if (rawTestSets && typeof rawTestSets === 'object' && 'examples' in (rawTestSets as Record<string, unknown>) && 'hidden' in (rawTestSets as Record<string, unknown>)) {
    const sets = rawTestSets as unknown as { examples: TestInputOutput[]; hidden: TestInputOutput[] };
    combinedTestCases = [
      ...sets.examples,
      ...sets.hidden
    ];
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
  let firstFailingResult = null;
  let overallStatus = "Accepted";

  if (Array.isArray(results)) {
    for (const res of results) {
      if (res.runtime && typeof res.runtime === 'number' && !isNaN(res.runtime)) {
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

  // 3. Save Submission
  const submission = await prisma.submission.create({
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
      userId: session.user.id,
      testCaseResults: results ? (results as unknown as Prisma.InputJsonValue) : [],
    },
  });

  // User Stats Update
  if (overallStatus === "Accepted") {
    const previousAccepted = await prisma.submission.count({
      where: {
        userId: session.user.id,
        problemId,
        status: "Accepted",
        id: { not: submission.id }
      }
    });

    if (previousAccepted === 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { solvedCount: { increment: 1 } }
      });
    }
  }

  let updatedStreak = 0;
  if (overallStatus === "Accepted") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streak: true, lastSolvedDate: true }
    });

    if (user) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate) : null;
      if (lastSolved) lastSolved.setUTCHours(0, 0, 0, 0);

      let newStreak = user.streak;
      if (!lastSolved) {
        newStreak = 1;
      } else if (lastSolved.getTime() !== today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        newStreak = lastSolved.getTime() === yesterday.getTime() ? newStreak + 1 : 1;
      }
      updatedStreak = newStreak;

      if (newStreak !== user.streak || !lastSolved || lastSolved.getTime() !== today.getTime()) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            streak: newStreak,
            lastSolvedDate: new Date()
          }
        });
      }
    }
  }

  // Contest Scoring
  if (overallStatus === "Accepted") {
    const now = new Date();
    const activeContests = await prisma.contest.findMany({
      where: {
        problems: { some: { id: problemId } },
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        registrations: { where: { userId: session.user.id } }
      }
    });

    for (const contest of activeContests) {
      if (contest.creatorId === session.user.id) continue;

      const registration = contest.registrations[0];
      if (registration) {
        const previousSolves = await prisma.submission.count({
          where: {
            problemId,
            userId: session.user.id,
            status: "Accepted",
            createdAt: { gte: contest.startTime, lte: contest.endTime },
            id: { not: submission.id }
          }
        });

        if (previousSolves === 0 && contest.isOfficial) {
          let points = 10;
          if (problem.difficulty === "Medium") points = 20;
          if (problem.difficulty === "Hard") points = 30;
          
          await prisma.contestRegistration.update({
            where: { id: registration.id },
            data: { score: { increment: points } }
          });
        }
      }

      // Leaderboard update
      const contestRegistrations = await prisma.contestRegistration.findMany({
        where: { contestId: contest.id },
        orderBy: [{ score: "desc" }, { registeredAt: "asc" }],
        include: { user: { select: { id: true, name: true, image: true } } },
      });

      let currentRank = 1;
      let previousScore = -1;
      const leaderboard = contestRegistrations.map((reg, index) => {
        if (reg.score !== previousScore) currentRank = index + 1;
        previousScore = reg.score;
        return {
          rank: currentRank,
          user: reg.user,
          score: reg.score,
        };
      });

      socket.emit("leaderboard_update", { contestId: contest.id, leaderboard });
    }
  }

  return NextResponse.json({ 
    submission,
    newStreak: updatedStreak,
    failedTestCase: firstFailingResult ? {
      input: firstFailingResult.input,
      output: firstFailingResult.actual,
      expected: firstFailingResult.expected
    } : null
  });
});
    