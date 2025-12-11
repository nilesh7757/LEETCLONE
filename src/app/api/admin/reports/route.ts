import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
