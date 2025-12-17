import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { executeCode, TestInputOutput } from "@/lib/codeExecution"; // Import TestInputOutput
import { analyzeCodeComplexity, evaluateSystemDesign } from "@/lib/gemini";
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
  } catch (error: unknown) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
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
    const { code, language, problemId, type } = await req.json();
    console.log("[DEBUG] Start Submission for:", problemId, type);

    // 1. Fetch the problem to get test cases, timeLimit, and memoryLimit
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: { // Explicitly select all fields, including new ones
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
        initialSchema: true, // New: SQL Schema
        initialData: true, // New: SQL Data
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        creatorId: true,
        type: true, // New: ProblemType
        contests: {
          select: {
            startTime: true,
            creatorId: true,
          },
        },
      },
    });
    console.log("[DEBUG] Problem Fetched");

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    let combinedTestCases: TestInputOutput[] = [];
    if (Array.isArray(problem.testSets)) {
      combinedTestCases = problem.testSets as unknown as TestInputOutput[];
    } else {
      console.error("api/submission/route.ts: problem.testSets was not an array or expected format:", problem.testSets);
      combinedTestCases = [];
    }

    // Access Control Check

    // 2. Execute Code
    console.log("[DEBUG] Executing Code...");
    let results;
    try {
      if (problem.type === "CODING") {
        if (!language) {
          return NextResponse.json({ error: "Language is required for CODING problem submission" }, { status: 400 });
        }
        results = await executeCode({
          problemId: problem.id,
          type: problem.type,
          language,
          code,
          testCases: combinedTestCases,
          timeLimit: problem.timeLimit,
          memoryLimit: problem.memoryLimit,
        });
      } else if (problem.type === "SQL") {
         results = await executeCode({
            problemId: problem.id,
            type: problem.type,
            code,
            initialSchema: problem.initialSchema || undefined,
            initialData: problem.initialData || undefined,
            testCases: combinedTestCases,
            // SQL typically doesn't need strict time/memory limits from user, but we can pass them if desired
         });
      } else if (problem.type === "SYSTEM_DESIGN") {
         // Evaluate using AI
         console.log("[DEBUG] Evaluating System Design...");
         const evalResult = await evaluateSystemDesign(
            `Title: ${problem.title}\nDescription: ${problem.description}`,
            code // The user's text answer
         );
         
         results = [{
            input: "System Design Answer",
            expected: "N/A",
            actual: evalResult.feedback,
            status: "Accepted"
         }];
         // ...
      } else {
        return NextResponse.json({ error: `Unsupported problem type for submission: ${problem.type}` }, { status: 400 });
      }
    } catch (error: unknown) {
       console.error("[DEBUG] Execution Failed:", error);
       return NextResponse.json({ error: error instanceof Error ? error.message : "Execution failed" }, { status: 400 });
    }
    console.log("[DEBUG] Results Generated");

    // Determine overall status
    let overallStatus = "Accepted";
    let maxRuntime = 0;
    let firstFailingResult = null;
    let geminiTimeComplexity = "N/A";
    let geminiSpaceComplexity = "N/A";

    if (problem.type === "CODING" || problem.type === "SQL") {
      if (Array.isArray(results)) {
        for (const res of results) {
          if (res.runtime && res.runtime > maxRuntime) maxRuntime = res.runtime;
          if (res.status !== "Accepted" && overallStatus === "Accepted") {
            overallStatus = res.status;
            firstFailingResult = res;
          }
        }
      }

      // Analyze Complexity (Optional, non-blocking if fails)
      try {
        if (problem.type === "CODING" && overallStatus === "Accepted") {
             const complexity = await analyzeCodeComplexity(code, language);
             geminiTimeComplexity = complexity.timeComplexity;
             geminiSpaceComplexity = complexity.spaceComplexity;
        }
      } catch (e) {
        console.error("Complexity analysis failed:", e);
      }
    }

    // 3. Save Submission to DB
    console.log("[DEBUG] Saving Submission...");
    const submission = await prisma.submission.create({
      data: {
        code,
        language: problem.type === "SQL" ? "sql" : (problem.type === "SYSTEM_DESIGN" ? "markdown" : language), 
        status: overallStatus,
        runtime: maxRuntime, 
        timeComplexity: geminiTimeComplexity,
        spaceComplexity: geminiSpaceComplexity,
        problemId,
        userId: session.user.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        testCaseResults: results ? (results as any) : [],
      },
    });
    console.log("[DEBUG] Submission Saved:", submission.id);

    let updatedStreak = 0;

    // --- STREAK & CONTEST SCORING LOGIC ---
    if (overallStatus === "Accepted") {
      console.log("[DEBUG] Updating Streak...");
      const now = new Date();
      
      // Update Streak
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { streak: true, lastSolvedDate: true }
      });

      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate) : null;
        if (lastSolved) lastSolved.setHours(0, 0, 0, 0);

        let newStreak = user.streak;

        if (!lastSolved) {
           // First ever solve
           newStreak = 1;
        } else if (lastSolved.getTime() === today.getTime()) {
           // Already solved today, keep streak
        } else {
           const yesterday = new Date(today);
           yesterday.setDate(yesterday.getDate() - 1);
           
           if (lastSolved.getTime() === yesterday.getTime()) {
              // Solved yesterday, increment streak
              newStreak++;
           } else {
              // Missed a day, reset streak
              newStreak = 1;
           }
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
      newStreak: updatedStreak,
      failedTestCase: firstFailingResult ? {
        input: firstFailingResult.input,
        output: firstFailingResult.actual,
        expected: firstFailingResult.expected
      } : null
        });
    
      } catch (error: unknown) {
        console.error("Submission error:", error);
        // Ensure socket connection errors are also logged
        if (socket.disconnected) {
            console.error("Socket.io client is disconnected.");
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    }
    