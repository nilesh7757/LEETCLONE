import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
