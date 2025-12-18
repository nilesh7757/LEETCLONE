import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  try {
    const studyPlan = await prisma.studyPlan.findUnique({
      where: { slug },
      include: {
        problems: {
          orderBy: { order: "asc" },
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                category: true,
              }
            }
          }
        }
      },
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Study plan not found" }, { status: 404 });
    }

    // Check if user is creator or admin
    if (studyPlan.creatorId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ studyPlan });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
