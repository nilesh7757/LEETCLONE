import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const { gameId, score } = await req.json();

  if (!gameId || typeof score !== "number") {
    throw new ApiError("Missing required fields", 400);
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
});
