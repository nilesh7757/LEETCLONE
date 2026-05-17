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

  const { title, description, startTime, endTime, visibility, accessCode, scoringType, problemIds, isOfficial } = await req.json();

  if (!title || !startTime || !endTime) {
    throw new ApiError("Title, start time, and end time are required", 400);
  }

  if (title.length > 200) {
    throw new ApiError("Title must be less than 200 characters", 400);
  }

  if (description && description.length > 5000) {
    throw new ApiError("Description must be less than 5000 characters", 400);
  }

  const contestStartTime = new Date(startTime);
  const contestEndTime = new Date(endTime);
  const now = new Date();

  if (contestStartTime < now) {
    throw new ApiError("Contest start time cannot be in the past", 400);
  }

  if (contestEndTime <= contestStartTime) {
    throw new ApiError("Contest end time must be after start time", 400);
  }

  const minDuration = 15 * 60 * 1000; // 15 minutes
  if (contestEndTime.getTime() - contestStartTime.getTime() < minDuration) {
    throw new ApiError("Contest must be at least 15 minutes long", 400);
  }

  // Admin check for official contests
  if (isOfficial && session.user.role !== "ADMIN") {
      throw new ApiError("Only admins can establish official arenas", 403);
  }

  // Ownership / Access check for problems
  const problems = await prisma.problem.findMany({
    where: {
      id: { in: problemIds || [] },
    },
    select: { id: true, creatorId: true, isPublic: true }
  });

  const unauthorizedProblems = problems.filter(p => !p.isPublic && p.creatorId !== session.user.id);
  if (unauthorizedProblems.length > 0) {
    throw new ApiError("Unauthorized access to one or more problems", 403);
  }

  const contest = await prisma.contest.create({
    data: {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      visibility: visibility || "PUBLIC",
      accessCode,
      scoringProtocol: scoringType || "CLASSIC",
      isOfficial: isOfficial || false,
      isRated: isOfficial || false,
      status: "READY", // Set to READY by default if created via launchpad
      creatorId: session.user.id,
      problems: {
        connect: (problemIds || []).map((id: string) => ({ id })),
      },
    },
  });

  return NextResponse.json({ contest }, { status: 201 });
});
