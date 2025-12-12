import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`[API] Fetching stats for user ID: ${id}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        rating: true,
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

    // Calculate Solved Counts (Unique problems only)
    const solvedProblems = new Set<string>();
    const solvedByDifficulty = {
      Easy: new Set<string>(),
      Medium: new Set<string>(),
      Hard: new Set<string>()
    };

    const submissionCounts: Record<string, number> = {};
    
    if (user.submissions && Array.isArray(user.submissions)) {
        user.submissions.forEach(sub => {
          // Heatmap Data
          if (sub.createdAt) {
              const date = new Date(sub.createdAt).toISOString().split("T")[0];
              submissionCounts[date] = (submissionCounts[date] || 0) + 1;
          }

          // Solved Counts
          if (sub.status === "Accepted") {
            solvedProblems.add(sub.problemId);
            if (sub.problem && sub.problem.difficulty) {
               // Normalize difficulty case just in case
               const diff = sub.problem.difficulty as "Easy" | "Medium" | "Hard";
               if (solvedByDifficulty[diff]) {
                 solvedByDifficulty[diff].add(sub.problemId);
               }
            }
          }
        });
    }

    const calendarData = Object.entries(submissionCounts).map(([date, count]) => ({
      date,
      count,
      level: Math.min(count, 4)
    }));

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
        solvedCount: solvedProblems.size,
        solvedEasy: solvedByDifficulty.Easy.size,
        solvedMedium: solvedByDifficulty.Medium.size,
        solvedHard: solvedByDifficulty.Hard.size,
      },
      ratingHistory: ratingHistoryData,
      calendarData
    });

  } catch (error: any) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
