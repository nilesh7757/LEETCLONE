import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const interview = await prisma.mockInterview.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, image: true }
      }
    }
  });

  if (!interview || interview.userId !== session.user.id) {
    throw new ApiError("Forbidden", 403);
  }

  return NextResponse.json({ interview });
});
