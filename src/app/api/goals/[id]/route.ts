import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/goals/[id]
export const PATCH = apiHandler(async (req: Request, { params }: RouteParams) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { id } = await params;
  const { isDone } = await req.json();

  if (typeof isDone !== "boolean") {
    throw new ApiError("isDone must be a boolean", 400);
  }

  // Ensure the goal belongs to the logged-in user
  const goal = await prisma.goal.findUnique({
    where: { id },
  });

  if (!goal) throw new ApiError("Goal not found", 404);
  if (goal.userId !== session.user.id) throw new ApiError("Forbidden", 403);

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: { isDone },
  });

  return NextResponse.json(updatedGoal);
});

// DELETE /api/goals/[id]
export const DELETE = apiHandler(async (req: Request, { params }: RouteParams) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { id } = await params;

  const goal = await prisma.goal.findUnique({
    where: { id },
  });

  if (!goal) throw new ApiError("Goal not found", 404);
  if (goal.userId !== session.user.id) throw new ApiError("Forbidden", 403);

  await prisma.goal.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
