import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const topPlayers = await prisma.user.findMany({
      where: {
        arcadePoints: {
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        arcadePoints: true
      },
      orderBy: {
        arcadePoints: "desc"
      },
      take: 10
    });

    return NextResponse.json(topPlayers);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
