import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const userId = session.user.id;
  const body = await req.json();
  const { problemId, quality } = body;

  if (!problemId || typeof quality !== "number" || quality < 0 || quality > 5) {
    throw new ApiError("Invalid parameters. Required: problemId, quality (0-5)", 400);
  }

  // Find if there is an existing review queue item
  const existing = await prisma.reviewQueue.findUnique({
    where: {
      userId_problemId: {
        userId,
        problemId,
      },
    },
  });

  let interval = 1;
  let easeFactor = 2.5;

  if (existing) {
    interval = existing.interval;
    easeFactor = existing.easeFactor;
  }

  // SuperMemo-2 Algorithm logic:
  if (quality < 3) {
    interval = 1;
  } else {
    // Multiply previous interval by easeFactor
    interval = Math.max(1, Math.round(interval * easeFactor));

    // Adjust ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  const reviewItem = await prisma.reviewQueue.upsert({
    where: {
      userId_problemId: {
        userId,
        problemId,
      },
    },
    update: {
      interval,
      easeFactor,
      nextReviewDate,
    },
    create: {
      userId,
      problemId,
      interval,
      easeFactor,
      nextReviewDate,
    },
  });

  return NextResponse.json({ success: true, reviewItem });
});
