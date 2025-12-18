import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
      include: { problems: true },
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Study plan not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isCreator = studyPlan.creatorId === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action, ...updates } = body;

    // Handle "Publish" action
    if (action === "PUBLISH") {
      if (studyPlan.status !== "DRAFT") {
        return NextResponse.json({ error: "Only draft plans can be submitted for publishing" }, { status: 400 });
      }
      
      await prisma.studyPlan.update({
        where: { id },
        data: { status: "PENDING_PUBLISH" },
      });
      return NextResponse.json({ message: "Sent for admin approval" });
    }

    // Handle standard updates
    if (isAdmin) {
      // Admin updates directly
      const updated = await prisma.studyPlan.update({
        where: { id },
        data: {
          ...updates,
          // Handle problems if provided
          problems: updates.problems ? {
            deleteMany: {},
            create: updates.problems.map((p: any, index: number) => ({
              problemId: p.problemId,
              order: p.order || (index + 1),
            })),
          } : undefined,
        },
      });
      return NextResponse.json({ studyPlan: updated });
    } else {
      // Creator updates
      if (studyPlan.status === "DRAFT") {
        const updated = await prisma.studyPlan.update({
          where: { id },
          data: {
            ...updates,
            problems: updates.problems ? {
              deleteMany: {},
              create: updates.problems.map((p: any, index: number) => ({
                problemId: p.problemId,
                order: p.order || (index + 1),
              })),
            } : undefined,
          },
        });
        return NextResponse.json({ studyPlan: updated });
      } else {
        // PUBLISHED or PENDING_UPDATE or PENDING_PUBLISH
        // Save to pendingData
        const updated = await prisma.studyPlan.update({
          where: { id },
          data: {
            status: studyPlan.status === "PUBLISHED" ? "PENDING_UPDATE" : studyPlan.status,
            pendingData: updates,
          },
        });
        return NextResponse.json({ 
          message: "Changes sent for admin approval", 
          studyPlan: updated 
        });
      }
    }
  } catch (error: any) {
    console.error("Study Plan update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Study plan not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isCreator = studyPlan.creatorId === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.studyPlan.delete({ where: { id } });
    return NextResponse.json({ message: "Study plan deleted" });
  } catch (error: any) {
    console.error("Study Plan deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
