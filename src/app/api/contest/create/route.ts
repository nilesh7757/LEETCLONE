import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const { title, description, startTime, endTime, problemIds, publishProblems, visibility, accessCode } = await req.json();
  
  logger.info(`Creating contest. User: ${session.user.id}, Data:`, { title, description, startTime, endTime, problemIds, publishProblems, visibility });

  if (!title || !startTime || !endTime) {
    throw new ApiError("Missing required fields", 400);
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    throw new ApiError("User not found in database. Please re-login.", 404);
  }

  // Restriction: Only Admins can create PUBLIC contests
  if (visibility === "PUBLIC" && user.role !== "ADMIN") {
    throw new ApiError("Only admins can create public contests. Please select Private.", 403);
  }

  const contestData: Prisma.ContestCreateInput = {
    title,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    publishProblems: publishProblems ?? false,
    visibility: visibility || "PUBLIC",
    accessCode: visibility === "PRIVATE" ? null : accessCode,
    creator: { connect: { id: session.user.id } },
  };

  if (problemIds && problemIds.length > 0) {
    contestData.problems = {
      connect: problemIds.map((id: string) => ({ id })),
    };
  }

  const contest = await prisma.contest.create({
    data: contestData,
  });

  return NextResponse.json({ contest });
});
