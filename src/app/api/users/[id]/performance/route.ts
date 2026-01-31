import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`[API] Fetching performance for user ID: ${id}`);

  try {
    const now = new Date();
    // Calculate sliding window: 4 months ago to 8 months ahead (Total 12 months)
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
                difficulty: true
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
      console.warn(`[API] User not found: ${id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Difficulty breakdown logic...
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
              } catch (e) {
                // Ignore
              }
          }
        });
    }

    // Fill in all days for the dynamic 12-month window
    const calendarData = [];
    let loopDate = new Date(startDate);
    
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
      },
      ratingHistory: ratingHistoryData,
      calendarData
    });

  } catch (error: any) {
    console.error("Failed to fetch user performance stats:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
