import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const userId = session.user.id;

  // Query prisma for all accepted submissions for this user
  const submissions = await prisma.submission.findMany({
    where: {
      userId,
      status: "Accepted",
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (submissions.length === 0) {
    return NextResponse.json({ streak: 0, solvedToday: false });
  }

  // Group unique days in descending order (using YYYY-MM-DD in UTC representation)
  const uniqueDays = Array.from(
    new Set(
      submissions.map((s) => s.createdAt.toISOString().split("T")[0])
    )
  ).sort((a, b) => b.localeCompare(a));

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const solvedToday = uniqueDays.includes(todayStr);
  const solvedYesterday = uniqueDays.includes(yesterdayStr);

  // If no accepted submission today or yesterday, streak is broken
  if (!solvedToday && !solvedYesterday) {
    return NextResponse.json({ streak: 0, solvedToday: false });
  }

  let streak = 0;
  const currentTargetDate = solvedToday ? new Date() : yesterday;

  while (true) {
    const targetStr = currentTargetDate.toISOString().split("T")[0];
    if (uniqueDays.includes(targetStr)) {
      streak++;
      currentTargetDate.setDate(currentTargetDate.getDate() - 1);
    } else {
      break;
    }
  }

  return NextResponse.json({ streak, solvedToday });
});
