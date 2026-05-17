import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { token, role } = await req.json();

  if (!token) {
    throw new ApiError("Token is required", 400);
  }

  const contest = await prisma.contest.findUnique({
    where: { shareToken: token }
  });

  if (!contest) {
    throw new ApiError("Invalid or expired link", 404);
  }

  // Check if already a collaborator
  const existing = await prisma.contestCollaborator.findFirst({
    where: {
      contestId: contest.id,
      userId: session.user.id
    }
  });

  if (existing) {
     return NextResponse.json({ id: contest.id, message: "Already joined" });
  }

  // Creator doesn't need to join
  if (contest.creatorId === session.user.id) {
     return NextResponse.json({ id: contest.id, message: "You are the creator" });
  }

  await prisma.contestCollaborator.create({
    data: {
      contestId: contest.id,
      userId: session.user.id,
      role: role || "TESTER"
    }
  });

  return NextResponse.json({ id: contest.id });
});
