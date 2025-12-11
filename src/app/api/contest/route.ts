import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    // Contests can be public, so no auth check needed for listing them.
    // However, joining or creating will require auth.

    try {
      const contests = await prisma.contest.findMany({
        where: {
          visibility: "PUBLIC",
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          problems: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: {
          startTime: "desc", // Show newest/upcoming first
        },
      });
  
      // Determine status for each contest (Upcoming, Active, Ended)
      const now = new Date();
      const contestsWithStatus = contests.map((contest) => {
        let status: string;
        if (contest.startTime > now) {
          status = "Upcoming";
        } else if (contest.endTime < now) {
          status = "Ended";
        } else {
          status = "Active";
        }
  
        // Hide problems if contest is upcoming and user is not creator
        let problems = contest.problems;
        if (status === "Upcoming" && (!userId || contest.creatorId !== userId)) {
          problems = [];
        }
  
        return {
          ...contest,
          status,
          problems, // Use the potentially filtered list
          participantsCount: contest._count.registrations,
        };
      });
  
      return NextResponse.json({ contests: contestsWithStatus });
  } catch (error) {
    console.error("Failed to fetch contests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
