import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const dueItems = await prisma.reviewQueue.findMany({
    where: {
      userId: session.user.id,
      nextReviewDate: {
        lte: new Date(),
      },
    },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
        },
      },
    },
    orderBy: {
      nextReviewDate: "asc",
    },
    take: 5,
  });

  return NextResponse.json({ success: true, dueItems });
});
