import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new ApiError("Unauthorized", 403);
  }

  const { action, reportId, userId } = await req.json();

  if (action === "WARN") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError("User not found", 404);

    const newWarnings = user.warnings + 1;
    const isBanned = newWarnings >= 3;

    await prisma.user.update({
      where: { id: userId },
      data: { 
        warnings: newWarnings,
        isBanned: isBanned
      }
    });
    
    // Mark report as resolved
    if (reportId) {
      await prisma.report.update({ where: { id: reportId }, data: { status: "RESOLVED" } });
    }

    return NextResponse.json({ message: `User warned. Total warnings: ${newWarnings}. Banned: ${isBanned}` });
  }

  if (action === "BAN") {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true }
    });
    if (reportId) {
        await prisma.report.update({ where: { id: reportId }, data: { status: "RESOLVED" } });
    }
    return NextResponse.json({ message: "User banned." });
  }

  if (action === "DISMISS") {
    if (!reportId) throw new ApiError("Report ID required", 400);
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "DISMISSED" }
    });
    return NextResponse.json({ message: "Report dismissed." });
  }

  throw new ApiError("Invalid action", 400);
});
