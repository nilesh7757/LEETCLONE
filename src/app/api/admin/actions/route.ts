import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { action, reportId, userId } = await req.json();

    if (action === "WARN") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
      if (!reportId) return NextResponse.json({ error: "Report ID required" }, { status: 400 });
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "DISMISSED" }
      });
      return NextResponse.json({ message: "Report dismissed." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
