import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId } = await req.json();

    const enrollment = await prisma.studyPlanEnrollment.upsert({
      where: {
        userId_studyPlanId: {
          userId: session.user.id,
          studyPlanId: planId,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        userId: session.user.id,
        studyPlanId: planId,
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      const { planId, reminderTime } = await req.json();
  
      const enrollment = await prisma.studyPlanEnrollment.update({
        where: {
          userId_studyPlanId: {
            userId: session.user.id,
            studyPlanId: planId,
          },
        },
        data: {
          reminderTime,
        },
      });
  
      return NextResponse.json(enrollment);
    } catch (error) {
      console.error("Reminder update error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
