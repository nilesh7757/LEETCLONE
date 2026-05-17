import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  // Verify ownership
  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem) throw new ApiError("Problem not found", 404);
  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  const { username, email, role } = await req.json();

  const userToAdd = await prisma.user.findFirst({ 
      where: { 
          OR: [
              { email: email || undefined },
              { name: username || undefined }
          ]
      } 
  });
  
  if (!userToAdd) throw new ApiError("User not found", 404);

  const collaborator = await prisma.problemCollaborator.create({
    data: {
      problemId: id,
      userId: userToAdd.id,
      role: role || "TESTER"
    }
  });

  return NextResponse.json({ collaborator });
});

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const collaborators = await prisma.problemCollaborator.findMany({
        where: { problemId: id },
        include: {
            user: { select: { name: true, email: true } }
        }
    });
    return NextResponse.json({ collaborators });
});
