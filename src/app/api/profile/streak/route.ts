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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastSolved = user?.lastSolvedDate ? new Date(user.lastSolvedDate) : null;
    if (lastSolved) lastSolved.setHours(0, 0, 0, 0);

    const solvedToday = lastSolved ? lastSolved.getTime() === today.getTime() : false;

    return NextResponse.json({ 
      streak: user?.streak || 0,
      solvedToday
    });
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
