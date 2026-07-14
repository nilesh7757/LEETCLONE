import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logger.info(`[API] Fetching performance for user ID: ${id}`);

  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 4, 1));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 8, 0));

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      rating: true,
      solvedCount: true,
      createdAt: true,
      warnings: true,
      isBanned: true,
      ratingHistory: {
        orderBy: { date: "asc" },
        select: {
          ratingAfter: true,
          date: true,
          contest: { select: { title: true } }
        }
      },
      submissions: {
        where: {
          createdAt: { 
              gte: startDate,
              lte: endDate
          }
        },
        select: {
          createdAt: true,
          status: true,
          problemId: true,
          problem: {
            select: {
              difficulty: true,
              category: true
            }
          }
        }
      },
      _count: {
        select: {
          following: true,
          followedBy: true
        }
      }
    }
  });

  if (!user) {
    logger.warn(`[API] User not found: ${id}`);
    throw new ApiError("User not found", 404);
  }

  // Difficulty breakdown
  const solvedStats = await prisma.problem.groupBy({
      by: ['difficulty'],
      where: {
          submissions: {
              some: {
                  userId: id,
                  status: "Accepted"
              }
          }
      },
      _count: { id: true }
  });

  const solvedByDifficulty: Record<string, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0
  };
  
  solvedStats.forEach(stat => {
      if (stat.difficulty in solvedByDifficulty) {
          solvedByDifficulty[stat.difficulty] = stat._count.id;
      }
  });

  // Category breakdown for Radar Chart
  const categoryStats = await prisma.problem.groupBy({
    by: ['category'],
    where: {
        submissions: {
            some: {
                userId: id,
                status: "Accepted"
            }
        }
    },
    _count: { id: true }
  });

  const categoryMap: Record<string, number> = {};
  categoryStats.forEach(stat => {
    categoryMap[stat.category] = stat._count.id;
  });

  const submissionCounts: Record<string, number> = {};
  if (user.submissions && Array.isArray(user.submissions)) {
      user.submissions.forEach(sub => {
        if (sub.createdAt) {
            try {
              const dateObj = new Date(sub.createdAt);
              const y = dateObj.getUTCFullYear();
              const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
              const d = String(dateObj.getUTCDate()).padStart(2, '0');
              const dateStr = `${y}-${m}-${d}`;
              submissionCounts[dateStr] = (submissionCounts[dateStr] || 0) + 1;
            } catch { }
        }
      });
  }

  const calendarData = [];
  const loopDate = new Date(startDate);
  while (loopDate <= endDate) {
      const y = loopDate.getUTCFullYear();
      const m = String(loopDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(loopDate.getUTCDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const count = submissionCounts[dateStr] || 0;
      calendarData.push({
          date: dateStr,
          count: count,
          level: count === 0 ? 0 : Math.min(Math.floor(count / 2) + 1, 4)
      });
      loopDate.setUTCDate(loopDate.getUTCDate() + 1);
  }

  const ratingHistoryData = (user.ratingHistory || []).map(h => ({
      rating: h.ratingAfter,
      date: h.date ? new Date(h.date).toISOString().split("T")[0] : "",
      contestName: h.contest?.title || "Unknown Contest"
  }));

  const recentSubmissions = await prisma.submission.findMany({
    where: { userId: id },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      problem: {
        select: {
          title: true,
          difficulty: true,
          slug: true
        }
      }
    }
  });

  return NextResponse.json({
    user: {
      name: user.name,
      rating: user.rating,
      joinedAt: user.createdAt,
      warnings: user.warnings,
      isBanned: user.isBanned,
      followersCount: user._count.followedBy,
      followingCount: user._count.following,
      solvedCount: user.solvedCount, 
      solvedEasy: solvedByDifficulty.Easy,
      solvedMedium: solvedByDifficulty.Medium,
      solvedHard: solvedByDifficulty.Hard,
      categoryStats: categoryMap
    },
    ratingHistory: ratingHistoryData,
    calendarData,
    recentSubmissions
  });
});
