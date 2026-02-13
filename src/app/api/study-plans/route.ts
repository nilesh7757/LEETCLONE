import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

interface ProblemInput {
  problemId: string;
  order?: number;
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { title, description, isPublic, problems, durationDays, isOfficial } = await req.json();

  if (!title || !description) {
    throw new ApiError("Title and description are required", 400);
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
        create: (problems || []).map((p: ProblemInput, index: number) => ({
          problemId: p.problemId,
          order: p.order || (index + 1),
        })),
      },
    },
  });

  return NextResponse.json({ studyPlan });
});
