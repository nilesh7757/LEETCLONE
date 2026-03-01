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

      if (previousSolves === 0 && contest.isOfficial) {
        let points = 10;
        if (problemDifficulty === "Medium") points = 20;
        if (problemDifficulty === "Hard") points = 30;
        
        await prisma.contestRegistration.update({
          where: { id: registration.id },
          data: { score: { increment: points } }
        });
        
        logger.info(`[CONTEST] Awarded ${points} points to user ${userId} for contest ${contest.id}`);
      }
    }

    // Update the real-time leaderboard
    await broadcastLeaderboardUpdate(contest.id);
  }
}

/**
 * Recalculates and broadcasts the leaderboard for a specific contest via Socket.io.
 */
async function broadcastLeaderboardUpdate(contestId: string) {
  const contestRegistrations = await prisma.contestRegistration.findMany({
    where: { contestId },
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

  socket.emit("leaderboard_update", { contestId, leaderboard });
}
