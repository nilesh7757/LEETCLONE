import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, feedback } = await req.json(); // feedback is optional

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
      include: { problems: true },
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Study plan not found" }, { status: 404 });
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
        const pendingData = studyPlan.pendingData as any;
        if (!pendingData) {
            return NextResponse.json({ error: "No pending data found" }, { status: 400 });
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
              create: problems.map((p: any, index: number) => ({
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

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin review error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
