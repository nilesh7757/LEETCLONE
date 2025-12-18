import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, isPublic, problems, durationDays, isOfficial } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Math.random().toString(36).substring(2, 7);

    // Only admins can create public or official plans. 
    // Regular users always create private plans for themselves.
    const isAdmin = session.user.role === "ADMIN";
    const finalIsPublic = isAdmin ? (isPublic ?? false) : false;
    const finalIsOfficial = isAdmin ? (isOfficial ?? false) : false;
    const finalStatus = isAdmin && finalIsPublic ? "PUBLISHED" : "DRAFT";

    const studyPlan = await prisma.studyPlan.create({
      data: {
        title,
        description,
        slug,
        isPublic: finalIsPublic,
        isOfficial: finalIsOfficial,
        status: finalStatus,
        durationDays: durationDays || 7,
        creatorId: session.user.id,
        problems: {
          create: (problems || []).map((p: any, index: number) => ({
            problemId: p.problemId,
            order: p.order || (index + 1),
          })),
        },
      },
    });

    return NextResponse.json({ studyPlan });
  } catch (error: any) {
    console.error("Study Plan creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
