import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { submissionId, reason } = await req.json();

  if (!submissionId || !reason) {
    throw new ApiError("Missing required fields", 400);
  }

  const report = await prisma.report.create({
    data: {
      submissionId,
      reporterId: session.user.id,
      reason,
      status: "PENDING"
    }
  });

  return NextResponse.json({ report });
});
