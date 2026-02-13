import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  const userId = session?.user?.id;
  
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;
  const statusFilter = searchParams.get("status"); // Upcoming, Active, Ended

  const now = new Date();
  const where: Record<string, unknown> = { visibility: "PUBLIC" };

  if (statusFilter === "Upcoming") {
    where.startTime = { gt: now };
  } else if (statusFilter === "Ended") {
    where.endTime = { lt: now };
  } else if (statusFilter === "Active") {
    where.startTime = { lte: now };
    where.endTime = { gte: now };
  }

  const [contests, total] = await Promise.all([
    prisma.contest.findMany({
      where,
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
        startTime: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.contest.count({ where })
  ]);

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
      problems,
      participantsCount: contest._count.registrations,
    };
  });

  return NextResponse.json({ 
    contests: contestsWithStatus,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});
