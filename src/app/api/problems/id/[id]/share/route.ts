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

  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem) throw new ApiError("Problem not found", 404);
  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  // Generate a random token if it doesn't exist
  const token = crypto.randomBytes(16).toString('hex');

  const updatedProblem = await prisma.problem.update({
    where: { id },
    data: { shareToken: token }
  });

  return NextResponse.json({ shareToken: updatedProblem.shareToken });
});

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const problem = await prisma.problem.findUnique({ 
      where: { id },
      select: { shareToken: true, creatorId: true }
  });

  if (!problem) throw new ApiError("Problem not found", 404);
  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  return NextResponse.json({ shareToken: problem.shareToken });
});
