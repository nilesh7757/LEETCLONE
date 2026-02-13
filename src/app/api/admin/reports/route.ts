import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async (_req: Request) => {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new ApiError("Unauthorized", 403);
  }

  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      submission: {
        select: {
          id: true,
          code: true,
          status: true,
          user: { select: { id: true, name: true, email: true, warnings: true, isBanned: true } },
          problem: { select: { title: true, slug: true } }
        }
      },
      reporter: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ reports });
});
