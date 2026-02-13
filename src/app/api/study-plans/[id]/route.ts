import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

interface ProblemInput {
  problemId: string;
  order?: number;
}

export const PATCH = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const studyPlan = await prisma.studyPlan.findUnique({
    where: { id },
    include: { problems: true },
  });

  if (!studyPlan) {
    throw new ApiError("Study plan not found", 404);
  }

  const isAdmin = session.user.role === "ADMIN";
  const isCreator = studyPlan.creatorId === session.user.id;

  if (!isAdmin && !isCreator) {
    throw new ApiError("Forbidden", 403);
  }

  const body = await req.json();
  const { action, ...updates } = body;

  // Handle "Publish" action
  if (action === "PUBLISH") {
    if (studyPlan.status !== "DRAFT") {
      throw new ApiError("Only draft plans can be submitted for publishing", 400);
    }
    
    await prisma.studyPlan.update({
      where: { id },
      data: { status: "PENDING_PUBLISH" },
    });
    return NextResponse.json({ message: "Sent for admin approval" });
  }

  // Handle standard updates
  if (isAdmin) {
    // Admin updates directly
    const updated = await prisma.studyPlan.update({
      where: { id },
      data: {
        ...updates,
        // Handle problems if provided
        problems: updates.problems ? {
          deleteMany: {},
          create: updates.problems.map((p: ProblemInput, index: number) => ({
            problemId: p.problemId,
            order: p.order || (index + 1),
          })),
        } : undefined,
      },
    });
    return NextResponse.json({ studyPlan: updated });
  } else {
    // Creator updates
    if (studyPlan.status === "DRAFT") {
      const updated = await prisma.studyPlan.update({
        where: { id },
        data: {
          ...updates,
          problems: updates.problems ? {
            deleteMany: {},
            create: updates.problems.map((p: ProblemInput, index: number) => ({
              problemId: p.problemId,
              order: p.order || (index + 1),
            })),
          } : undefined,
        },
      });
      return NextResponse.json({ studyPlan: updated });
    } else {
      // PUBLISHED or PENDING_UPDATE or PENDING_PUBLISH
      // Save to pendingData
      const updated = await prisma.studyPlan.update({
        where: { id },
        data: {
          status: studyPlan.status === "PUBLISHED" ? "PENDING_UPDATE" : studyPlan.status,
          pendingData: updates,
        },
      });
      return NextResponse.json({ 
        message: "Changes sent for admin approval", 
        studyPlan: updated 
      });
    }
  }
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const studyPlan = await prisma.studyPlan.findUnique({
    where: { id },
  });

  if (!studyPlan) {
    throw new ApiError("Study plan not found", 404);
  }

  const isAdmin = session.user.role === "ADMIN";
  const isCreator = studyPlan.creatorId === session.user.id;

  if (!isAdmin && !isCreator) {
    throw new ApiError("Forbidden", 403);
  }

  await prisma.studyPlan.delete({ where: { id } });
  return NextResponse.json({ message: "Study plan deleted" });
});
