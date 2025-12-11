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
            status: true
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

    // Format Data for Contribution Calendar
    const submissionCounts: Record<string, number> = {};
    if (user.submissions && Array.isArray(user.submissions)) {
        user.submissions.forEach(sub => {
          if (sub.createdAt) {
              const date = new Date(sub.createdAt).toISOString().split("T")[0];
              submissionCounts[date] = (submissionCounts[date] || 0) + 1;
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
      },
      ratingHistory: ratingHistoryData,
      calendarData
    });

  } catch (error: any) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
