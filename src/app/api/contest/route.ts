import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "ALL";

  const now = new Date();

  const contests = await prisma.contest.findMany({
    where: {
      visibility: "PUBLIC",
    },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
      problems: {
        select: { id: true, title: true, difficulty: true },
      },
      _count: {
        select: { registrations: true },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  const contestsWithStatus = contests.map((contest) => {
    let status: "Upcoming" | "Active" | "Ended" = "Upcoming";
    if (now >= contest.startTime && now <= contest.endTime) {
      status = "Active";
    } else if (now > contest.endTime) {
      status = "Ended";
    }

    return {
      ...contest,
      status,
      participantsCount: contest._count.registrations,
    };
  });

  return NextResponse.json({ contests: contestsWithStatus });
});
