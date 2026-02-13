import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async (_req: Request) => {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new ApiError("Unauthorized", 401);
  }

  const pendingPlans = await prisma.studyPlan.findMany({
    where: {
      status: { in: ["PENDING_PUBLISH", "PENDING_UPDATE"] },
    },
    include: {
      creator: {
        select: { name: true, email: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ studyPlans: pendingPlans });
});
