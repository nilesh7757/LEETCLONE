import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

interface ProblemInput {
  problemId: string;
  order?: number;
}

interface PendingData {
  problems?: ProblemInput[];
  [key: string]: unknown;
}

export const POST = apiHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new ApiError("Unauthorized", 401);
  }

  const { action } = await req.json(); // feedback is optional

  const studyPlan = await prisma.studyPlan.findUnique({
    where: { id },
    include: { problems: true },
  });

  if (!studyPlan) {
    throw new ApiError("Study plan not found", 404);
  }

  if (action === "APPROVE") {
    if (studyPlan.status === "PENDING_PUBLISH") {
      await prisma.studyPlan.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          isPublic: true,
        },
      });
    } else if (studyPlan.status === "PENDING_UPDATE") {
      const pendingData = studyPlan.pendingData as unknown as PendingData;
      if (!pendingData) {
          throw new ApiError("No pending data found", 400);
      }

      const { problems, ...otherFields } = pendingData;

      await prisma.studyPlan.update({
        where: { id },
        data: {
          ...otherFields,
          status: "PUBLISHED",
          pendingData: Prisma.DbNull,
          problems: problems ? {
            deleteMany: {},
            create: problems.map((p: ProblemInput, index: number) => ({
              problemId: p.problemId,
              order: p.order || (index + 1),
            })),
          } : undefined,
        },
      });
    }
    return NextResponse.json({ message: "Approved successfully" });
  } else if (action === "REJECT") {
    await prisma.studyPlan.update({
      where: { id },
      data: {
        status: studyPlan.status === "PENDING_PUBLISH" ? "DRAFT" : "PUBLISHED",
        pendingData: Prisma.DbNull,
      },
    });
    return NextResponse.json({ message: "Rejected successfully" });
  }

  throw new ApiError("Invalid action", 400);
});
