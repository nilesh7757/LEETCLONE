import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendUnfinishedGoalsEmail } from "@/lib/mail";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Fetch all uncompleted goals scheduled for today or earlier
    const pendingGoals = await prisma.goal.findMany({
      where: {
        isDone: false,
        date: {
          lte: todayEnd,
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (pendingGoals.length === 0) {
      return NextResponse.json({ message: "No pending goals found for carryover." });
    }

    // 2. Group goals by user
    const userGoalsMap: Record<string, { email: string; goals: typeof pendingGoals }> = {};
    for (const goal of pendingGoals) {
      if (!goal.userId || !goal.user?.email) continue;
      if (!userGoalsMap[goal.userId]) {
        userGoalsMap[goal.userId] = {
          email: goal.user.email,
          goals: [],
        };
      }
      userGoalsMap[goal.userId].goals.push(goal);
    }

    // 3. Send email to each user
    for (const userId of Object.keys(userGoalsMap)) {
      const { email, goals } = userGoalsMap[userId];
      try {
        await sendUnfinishedGoalsEmail(email, goals);
      } catch (err) {
        logger.error(`Failed to send carryover email to ${email}:`, err);
      }
    }

    // 4. Update the date of all pending goals to tomorrow (noon)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const goalIds = pendingGoals.map((g) => g.id);
    await prisma.goal.updateMany({
      where: {
        id: {
          in: goalIds,
        },
      },
      data: {
        date: tomorrow,
      },
    });

    return NextResponse.json({
      success: true,
      carriedCount: pendingGoals.length,
      usersNotified: Object.keys(userGoalsMap).length,
    });
  } catch (error) {
    logger.error("[GOALS_CARRYOVER] Error:", error);
    return NextResponse.json({ error: "Carryover processing failed" }, { status: 500 });
  }
}
