import { prisma } from "@/lib/prisma";
import { socketClient } from "@/lib/socket-client";
import { logger } from "@/lib/logger";

// Ensure socket is connected for leaderboard updates
socketClient.connect();
const socket = socketClient.socket;

/**
 * Handles scoring and leaderboard updates for active contests related to a problem.
 */
export async function processContestScoring(
  userId: string,
  problemId: string,
  problemDifficulty: string,
  submissionId: string
) {
  const now = new Date();
  
  // Find all active contests that include this problem
  const activeContests = await prisma.contest.findMany({
    where: {
      problems: { some: { id: problemId } },
      startTime: { lte: now },
      endTime: { gte: now },
    },
    include: {
      registrations: { where: { userId } }
    }
  });

  for (const contest of activeContests) {
    // Skip if the user is the creator of the contest
    if (contest.creatorId === userId) continue;

    const registration = contest.registrations[0];
    if (registration) {
      // Check if this is the user's first accepted submission for this problem in this contest
      const previousSolves = await prisma.submission.count({
        where: {
          problemId,
          userId,
          status: "Accepted",
          createdAt: { gte: contest.startTime, lte: contest.endTime },
          id: { not: submissionId }
        }
      });

      // Award points for both official and unofficial contests
      if (previousSolves === 0) {
        let points = 10;
        if (problemDifficulty === "Medium") points = 20;
        if (problemDifficulty === "Hard") points = 30;
        
        // Handle Decaying Scoring Protocol (Tactical) - accept legacy FIXED value as CLASSIC
        if (contest.scoringProtocol === "DECAY" || contest.scoringProtocol === "TACTICAL") {
             const minutesElapsed = Math.floor((now.getTime() - contest.startTime.getTime()) / 60000);
             // Simple decay: lose 1% of points every 2 minutes, minimum 50% of original value
             const decayFactor = Math.max(0.5, 1 - (minutesElapsed / 200));
             points = Math.floor(points * decayFactor);
        }
        
        const penalty = Math.floor((now.getTime() - contest.startTime.getTime()) / 60000);

        await prisma.contestRegistration.update({
          where: { id: registration.id },
          data: { 
            score: { increment: points },
            // Storing current total penalty in 'rank' as a workaround until schema is updated
            // Note: This is a simplified approach; true penalty is the sum of solve times for ACs.
            rank: { increment: penalty } 
          }
        });
        
        logger.info(`[CONTEST] Awarded ${points} points to user ${userId} for contest ${contest.id}. Penalty: ${penalty}m`);
      }
    }

    // Update the real-time leaderboard
    await broadcastLeaderboardUpdate(contest.id);
  }
}

/**
 * Recalculates and broadcasts the leaderboard for a specific contest via Socket.io.
 * Tie-breaker: Earlier total time (Penalty) wins if scores are equal.
 */
async function broadcastLeaderboardUpdate(contestId: string) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId }
  });

  if (!contest) return;

  const contestRegistrations = await prisma.contestRegistration.findMany({
    where: { contestId },
    include: { 
        user: { select: { id: true, name: true, image: true } },
    },
  });

  if (contestRegistrations.length === 0) {
      socket.emit("leaderboard_update", { contestId, leaderboard: [] });
      return;
  }

  const participantIds = contestRegistrations.map(reg => reg.userId);

  // OPTIMIZED: Fetch all first AC submissions for ALL users in this contest in one go
  const allAcceptedSubmissions = await prisma.submission.findMany({
      where: {
          userId: { in: participantIds },
          status: "Accepted",
          problem: { contests: { some: { id: contestId } } },
          createdAt: { gte: contest.startTime, lte: contest.endTime }
      },
      orderBy: { createdAt: "asc" }
  });

  // Group by userId and pick the first AC for each problemId
  const userFirstSolves: Record<string, Record<string, Date>> = {};
  
  allAcceptedSubmissions.forEach(sub => {
      if (!userFirstSolves[sub.userId]) {
          userFirstSolves[sub.userId] = {};
      }
      // Since they are ordered by createdAt ASC, the first one we see is the earliest
      if (!userFirstSolves[sub.userId][sub.problemId]) {
          userFirstSolves[sub.userId][sub.problemId] = sub.createdAt;
      }
  });

  const leaderboardData = contestRegistrations.map((reg) => {
      const firstSolves = userFirstSolves[reg.userId] || {};
      
      const totalPenalty = Object.values(firstSolves).reduce((acc, createdAt) => {
          const solveTime = Math.floor((createdAt.getTime() - contest.startTime.getTime()) / 60000);
          return acc + Math.max(0, solveTime); 
      }, 0);

      return {
          reg,
          totalPenalty
      };
  });

  // Sort: Higher Score -> Lower Penalty
  leaderboardData.sort((a, b) => {
      if (b.reg.score !== a.reg.score) return b.reg.score - a.reg.score;
      return a.totalPenalty - b.totalPenalty;
  });

  const leaderboard = leaderboardData.map((data, index) => ({
      rank: index + 1,
      user: data.reg.user,
      score: data.reg.score,
      totalPenalty: data.totalPenalty
  }));

  socket.emit("leaderboard_update", { contestId, leaderboard });
}
