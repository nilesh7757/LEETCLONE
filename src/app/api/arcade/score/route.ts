import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId, score } = await req.json();

    if (!gameId || typeof score !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate AP Reward (e.g., score / 10)
    const apReward = Math.floor(score / 10);

    // Atomic transaction: Save score and update user points
    await prisma.$transaction([
      prisma.arcadeScore.create({
        data: {
          userId: session.user.id,
          gameId: gameId,
          score: score
        }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          arcadePoints: {
            increment: apReward
          }
        }
      })
    ]);

    return NextResponse.json({ success: true, reward: apReward });
  } catch (error: unknown) {
    console.error("Arcade score error:", error);
    return NextResponse.json({ error: "Failed to record score" }, { status: 500 });
  }
}
