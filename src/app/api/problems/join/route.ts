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

  const problem = await prisma.problem.findUnique({
    where: { shareToken: token }
  });

  if (!problem) {
    throw new ApiError("Invalid or expired link", 404);
  }

  // Check if already a collaborator
  const existing = await prisma.problemCollaborator.findFirst({
    where: {
      problemId: problem.id,
      userId: session.user.id
    }
  });

  if (existing) {
     return NextResponse.json({ id: problem.id, message: "Already joined" });
  }

  // Creator doesn't need to join
  if (problem.creatorId === session.user.id) {
     return NextResponse.json({ id: problem.id, message: "You are the creator" });
  }

  await prisma.problemCollaborator.create({
    data: {
      problemId: problem.id,
      userId: session.user.id,
      role: role || "TESTER"
    }
  });

  return NextResponse.json({ id: problem.id });
});
