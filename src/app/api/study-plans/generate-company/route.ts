import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { company } = await req.json();
  if (!company) throw new ApiError("Company name is required", 400);

  // 1. Fetch problems containing the company tag
  const problems = await prisma.problem.findMany({
    where: {
      companies: {
        has: company
      }
    },
    take: 15 // Limit prep kit to 15 questions
  });

  if (problems.length === 0) {
    throw new ApiError(`No problems found in the problem set for ${company}.`, 404);
  }

  // 2. Create the study plan
  const slug = `prep-kit-${company.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;
  const title = `${company} Interview Prep Kit`;
  const description = `A curated set of ${problems.length} challenges frequently asked in ${company} technical interviews.`;

  const newPlan = await prisma.studyPlan.create({
    data: {
      title,
      slug,
      description,
      creatorId: session.user.id,
      isPublic: false,
      problems: {
        create: problems.map((prob, index) => ({
          problemId: prob.id,
          order: index + 1
        }))
      }
    }
  });

  return NextResponse.json({
    title,
    slug,
    problemsCount: problems.length
  });
});
