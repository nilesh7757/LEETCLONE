import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import crypto from "crypto";

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const contest = await prisma.contest.findUnique({ where: { id } });
  if (!contest) throw new ApiError("Contest not found", 404);
  if (contest.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  const token = crypto.randomBytes(16).toString('hex');

  const updatedContest = await prisma.contest.update({
    where: { id },
    data: { shareToken: token }
  });

  return NextResponse.json({ shareToken: updatedContest.shareToken });
});

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const contest = await prisma.contest.findUnique({ 
      where: { id },
      select: { shareToken: true, creatorId: true }
  });

  if (!contest) throw new ApiError("Contest not found", 404);
  if (contest.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  return NextResponse.json({ shareToken: contest.shareToken });
});
