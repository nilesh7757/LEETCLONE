import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ResourceType, Prisma } from "@prisma/client";

export const GET = apiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const type = searchParams.get("type") as ResourceType | null;

  const where: Prisma.LearningResourceWhereInput = {
    isPublic: true,
  };

  if (topic) {
    where.topic = topic;
  }

  if (type) {
    where.type = type;
  }

  const resources = await prisma.learningResource.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      problems: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return NextResponse.json({ resources });
});
