import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streak: true, lastSolvedDate: true }
    });

    if (!user) return NextResponse.json({ streak: 0, solvedToday: false });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate) : null;
    if (lastSolved) lastSolved.setUTCHours(0, 0, 0, 0);

    let currentStreak = user.streak;
    const solvedToday = lastSolved ? lastSolved.getTime() === today.getTime() : false;

    // Auto-reset logic: If not solved today AND not solved yesterday, streak is broken
    if (!solvedToday && (!lastSolved || lastSolved.getTime() < yesterday.getTime())) {
      if (currentStreak > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { streak: 0 }
        });
        currentStreak = 0;
      }
    }

    return NextResponse.json({ 
      streak: currentStreak,
      solvedToday
    });
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
