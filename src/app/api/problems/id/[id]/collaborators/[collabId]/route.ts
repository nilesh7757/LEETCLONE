import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string, collabId: string }> }) => {
  const { id, collabId } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  // Verify ownership of the problem
  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem) throw new ApiError("Problem not found", 404);
  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  await prisma.problemCollaborator.delete({
    where: { id: collabId }
  });

  return NextResponse.json({ success: true });
});
