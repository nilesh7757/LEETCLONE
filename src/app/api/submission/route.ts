import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput } from "@/lib/codeExecution"; // Import TestInputOutput
import { analyzeCodeComplexity } from "@/lib/gemini";
import { io as ClientIO } from "socket.io-client"; // Import as ClientIO to avoid conflict

// Initialize Socket.io client (connect to your socket.io server)
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const socket = ClientIO(socketUrl); // Adjust URL if your server is elsewhere

socket.on("connect", () => {
  console.log("Connected to Socket.io server from submission API route");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.io server from submission API route");
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId");

    if (!problemId) {
      return NextResponse.json({ error: "Problem ID is required" }, { status: 400 });
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
        runtime: true,
        timeComplexity: true,
        spaceComplexity: true,
        createdAt: true,
        problemId: true,
        userId: true,
        testCaseResults: true, // Explicitly select the new field
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, language, problemId } = await req.json();

    // 1. Fetch the problem to get test cases, timeLimit, and memoryLimit
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        contests: {
          select: {
            startTime: true,
            creatorId: true,
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Access Control Check
    const now = new Date();
    const isVisible =
      problem.isPublic ||
      (session.user?.id && problem.creatorId === session.user.id) ||
      problem.contests.some((contest) => {
        const hasStarted = new Date(contest.startTime) <= now;
        const isContestCreator = session.user?.id ? contest.creatorId === session.user.id : false;
        return hasStarted || isContestCreator;
      });

    if (!isVisible) {
      return NextResponse.json({ error: "Problem is not currently accessible" }, { status: 403 });
    }

    let allTestSets: { examples: { input: string, output: string }[], hidden: { input: string, output: string }[] } = { examples: [], hidden: [] };
    const rawTestSets = problem.testSets;

    if (rawTestSets) {
      try {
        const parsed = typeof rawTestSets === 'string' ? JSON.parse(rawTestSets) : rawTestSets;
        
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          allTestSets = {
            examples: Array.isArray(parsed.examples) ? parsed.examples : [],
            hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
          };
        } else {
          console.error("Parsed problem.testSets is not an object or is null in /api/submission:", parsed, rawTestSets);
        }
      } catch (e) {
        console.error("Error parsing problem.testSets in /api/submission:", e, rawTestSets);
      }
    } else {
      console.log("problem.testSets is null or undefined in /api/submission.", rawTestSets);
    }
    
    // Combine all test cases (examples and hidden) for submission evaluation
    const combinedTestCases: TestInputOutput[] = (allTestSets.examples || [])
      .concat(allTestSets.hidden || [])
      .map(tc => ({ input: tc.input, expectedOutput: tc.output }));

    // 2. Execute Code
    let results;
    try {
      results = await executeCode(language, code, combinedTestCases, problem.timeLimit, problem.memoryLimit);
    } catch (error: any) {
       return NextResponse.json({ error: error.message || "Execution failed" }, { status: 400 });
    }

    // Determine overall status and find the first failing test case
    const firstFailingResult = results.find(r => r.status !== "Accepted");
    const overallStatus: typeof results[0]['status'] = firstFailingResult ? firstFailingResult.status : "Accepted";
    
    // Calculate max runtime and max memory across all test cases (Standard for competitive programming)
    // Previously it was sum, which inflated the runtime for many test cases.
    const maxRuntime = results.reduce((max, r) => Math.max(max, (r.runtime || 0)), 0);
    const maxMemory = results.reduce((max, r) => Math.max(max, (r.memory || 0)), 0);

    let geminiTimeComplexity: string = "N/A";
    let geminiSpaceComplexity: string = "N/A";

    // Analyze complexity even if TLE/MLE, so users can see why their code failed.
    try {
      const { timeComplexity, spaceComplexity } = await analyzeCodeComplexity(code, language);
      geminiTimeComplexity = timeComplexity;
      geminiSpaceComplexity = spaceComplexity;
    } catch (geminiError) {
      console.error("Error analyzing complexity with Gemini:", geminiError);
      // Continue without complexity if Gemini fails
    }

    // 3. Save Submission to DB
    const submission = await prisma.submission.create({
      data: {
        code,
        language,
        status: overallStatus,
        runtime: maxRuntime, // Store the max runtime of a single test case
        timeComplexity: geminiTimeComplexity, // Always store the analyzed complexity (e.g., O(N^2))
        spaceComplexity: geminiSpaceComplexity,
        problemId,
        userId: session.user.id,
        testCaseResults: results as any, // Save the detailed results
      },
    });

    // --- CONTEST SCORING LOGIC ---
    if (overallStatus === "Accepted") {
      const now = new Date();
      // Find active contests for this problem
      const activeContests = await prisma.contest.findMany({
        where: {
          problems: { some: { id: problemId } },
          startTime: { lte: now },
          endTime: { gte: now },
        },
        include: {
          registrations: {
            where: { userId: session.user.id }
          }
        }
      });

      for (const contest of activeContests) {
        // Skip scoring if the user is the contest creator
        if (contest.creatorId === session.user.id) {
          continue;
        }

        // Check if user is registered
        const registration = contest.registrations[0];
        if (registration) {
          // Check if user has ALREADY solved this problem in this contest
          // We look for any PREVIOUS submission (excluding the one we just created)
          // that was Accepted and created during the contest window.
          const previousSolves = await prisma.submission.count({
            where: {
              problemId,
              userId: session.user.id,
              status: "Accepted",
              createdAt: {
                gte: contest.startTime,
                lte: contest.endTime,
              },
              id: { not: submission.id } // Exclude current submission
            }
          });

          if (previousSolves === 0) {
            // First time solving this problem in this contest!
            // Assign points based on difficulty (Easy=10, Medium=20, Hard=30)
            let points = 10;
            if (problem.difficulty === "Medium") points = 20;
            if (problem.difficulty === "Hard") points = 30;
            
            // Only update score for official contests, as per user request
            if (contest.isOfficial) { 
                await prisma.contestRegistration.update({
                    where: { id: registration.id },
                    data: {
                        score: { increment: points }
                    }
                });
            }
          }
        }
      }

      // --- Emit Leaderboard Update ---
      if (activeContests.length > 0) {
          // Helper function to get and format the contest leaderboard
          const getContestLeaderboard = async (contestId: string) => {
            const contestRegistrations = await prisma.contestRegistration.findMany({
              where: { contestId },
              orderBy: [{ score: "desc" }, { registeredAt: "asc" }], // Sort by score (desc), then registration time (asc)
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            });

            // Assign ranks based on sorted scores
            let currentRank = 1;
            let previousScore = -1; // Assuming scores are non-negative
            const leaderboard = contestRegistrations.map((reg, index) => {
              if (reg.score !== previousScore) {
                currentRank = index + 1;
              }
              previousScore = reg.score;
              return {
                rank: currentRank,
                user: { id: reg.user.id, name: reg.user.name, image: reg.user.image },
                score: reg.score,
              };
            });

            return leaderboard;
          };

          for (const contest of activeContests) {
              // Recalculate leaderboard for each affected contest
              const updatedLeaderboard = await getContestLeaderboard(contest.id);
              socket.emit("leaderboard_update", { contestId: contest.id, leaderboard: updatedLeaderboard });
              console.log(`Emitted leaderboard_update for contest ${contest.id}`);
          }
      }
    }
    // -----------------------------
    // -----------------------------

    return NextResponse.json({ 
      submission,
      failedTestCase: firstFailingResult ? {
        input: firstFailingResult.input,
        output: firstFailingResult.actual,
        expected: firstFailingResult.expected
      } : null
    });

  } catch (error) {
    console.error("Submission error:", error);
    // Ensure socket connection errors are also logged
    if (socket.disconnected) {
        console.error("Socket.io client is disconnected.");
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}