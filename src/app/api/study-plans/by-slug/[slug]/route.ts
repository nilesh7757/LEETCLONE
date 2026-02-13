import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async (
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const studyPlan = await prisma.studyPlan.findUnique({
    where: { slug },
    include: {
      problems: {
        orderBy: { order: "asc" },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              category: true,
            }
          }
        }
      }
    },
  });

  if (!studyPlan) {
    throw new ApiError("Study plan not found", 404);
  }

  // Check if user is creator or admin
  if (studyPlan.creatorId !== userId && !isAdmin) {
    throw new ApiError("Forbidden", 403);
  }

  return NextResponse.json({ studyPlan });
});
