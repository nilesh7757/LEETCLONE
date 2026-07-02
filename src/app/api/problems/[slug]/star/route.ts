import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    throw new ApiError("Unauthorized", 401);
  }
  const userId = session.user.id;

  // 1. Find the problem by slug
  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  // 2. Check if already starred
  const existingStar = await prisma.starredProblem.findUnique({
    where: {
      userId_problemId: {
        userId,
        problemId: problem.id
      }
    }
  });

  let isStarred = false;

  if (existingStar) {
    // Unstar
    await prisma.starredProblem.delete({
      where: {
        id: existingStar.id
      }
    });
    isStarred = false;
  } else {
    // Star
    await prisma.starredProblem.create({
      data: {
        userId,
        problemId: problem.id
      }
    });
    isStarred = true;
  }

  return NextResponse.json({ starred: isStarred });
});
