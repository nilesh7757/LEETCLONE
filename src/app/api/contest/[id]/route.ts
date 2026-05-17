import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { Prisma } from "@prisma/client";

// GET /api/contest/[id]
export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          category: true,
          verificationStatus: true,
        },
      },
      registrations: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  if (!contest) {
    throw new ApiError("Contest not found", 404);
  }

  return NextResponse.json({ contest });
});

// PATCH /api/contest/[id]/update
export const PATCH = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: true,
    }
  });

  if (!contest) {
    throw new ApiError("Contest not found", 404);
  }

  // Only creator or ADMIN can update
  if (contest.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  const body = await req.json();
  const { 
    title, 
    description, 
    startTime, 
    endTime, 
    visibility, 
    accessCode, 
    scoringProtocol, 
    status,
    problemIds,
    publishProblems
  } = body;

  const validTransitions: Record<string, string[]> = {
    DRAFT: ["VETTING", "READY"],
    VETTING: ["DRAFT", "READY"],
    READY: ["DRAFT", "LIVE"],
    LIVE: ["ENDED"],
    ENDED: [],
  };

  if (status && contest.status !== status) {
    const allowed = validTransitions[contest.status] || [];
    if (!allowed.includes(status)) {
      throw new ApiError(`Cannot transition from ${contest.status} to ${status}`, 400);
    }
  }

  if (startTime || endTime) {
    const newStartTime = startTime ? new Date(startTime) : contest.startTime;
    const newEndTime = endTime ? new Date(endTime) : contest.endTime;
    const now = new Date();

    if (new Date(newStartTime) < now && contest.status === "DRAFT") {
      throw new ApiError("Start time cannot be in the past for draft contests", 400);
    }

    if (new Date(newEndTime) <= new Date(newStartTime)) {
      throw new ApiError("End time must be after start time", 400);
    }

    const duration = new Date(newEndTime).getTime() - new Date(newStartTime).getTime();
    const minDuration = 15 * 60 * 1000;
    if (duration < minDuration) {
      throw new ApiError("Contest must be at least 15 minutes long", 400);
    }
  }

  if (status === "LIVE" && !problemIds?.length && !contest.problems.length) {
    throw new ApiError("Cannot publish contest with no problems", 400);
  }

  const updateData: Prisma.ContestUpdateInput = {
    title,
    description,
    startTime: startTime ? new Date(startTime) : undefined,
    endTime: endTime ? new Date(endTime) : undefined,
    visibility,
    accessCode,
    scoringProtocol,
    status,
    publishProblems,
  };

  if (problemIds) {
    updateData.problems = {
      set: problemIds.map((id: string) => ({ id })),
    };
  }

  const updatedContest = await prisma.contest.update({
    where: { id },
    data: updateData,
    include: {
      problems: true,
    }
  });

  return NextResponse.json({ contest: updatedContest });
});

// DELETE /api/contest/[id]
export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const contest = await prisma.contest.findUnique({
    where: { id },
  });

  if (!contest) {
    throw new ApiError("Contest not found", 404);
  }

  if (contest.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  await prisma.contest.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Contest deleted successfully" });
});
