import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

// GET /api/goals?month=07&year=2026
export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || "");
  const year = parseInt(searchParams.get("year") || "");

  if (isNaN(month) || isNaN(year)) {
    throw new ApiError("Invalid month or year parameters", 400);
  }

  // Create start and end range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const [goals, contests] = await Promise.all([
    prisma.goal.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.contest.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
      },
    }),
  ]);

  return NextResponse.json({ goals, contests });
});

// POST /api/goals
export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { title, date, endDate } = await req.json();
  if (!title || !date) {
    throw new ApiError("Missing title or date", 400);
  }

  const startDateParsed = new Date(date);
  if (isNaN(startDateParsed.getTime())) {
    throw new ApiError("Invalid start date format", 400);
  }

  if (endDate) {
    const endDateParsed = new Date(endDate);
    if (isNaN(endDateParsed.getTime())) {
      throw new ApiError("Invalid end date format", 400);
    }

    if (endDateParsed < startDateParsed) {
      throw new ApiError("End date cannot be before start date", 400);
    }

    const createdGoals = [];
    const currentDate = new Date(startDateParsed);

    while (currentDate <= endDateParsed) {
      const targetDate = new Date(currentDate);
      targetDate.setHours(12, 0, 0, 0);

      const newGoal = await prisma.goal.create({
        data: {
          userId: session.user.id,
          title,
          date: targetDate,
          isDone: false,
        },
      });
      createdGoals.push(newGoal);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(createdGoals);
  } else {
    const targetDate = new Date(startDateParsed);
    targetDate.setHours(12, 0, 0, 0);

    const newGoal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        date: targetDate,
        isDone: false,
      },
    });

    return NextResponse.json(newGoal);
  }
});
