import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  const userId = session?.user?.id;
  
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const whereClause: any = {
    AND: [
      {
        OR: [
          { isPublic: true },
          { contests: { some: { endTime: { lte: new Date() }, publishProblems: true } } }
        ]
      }
    ]
  };

  if (userId) {
    whereClause.AND[0].OR.push({ creatorId: userId });
  }

  if (query) {
    whereClause.AND.push({
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ]
    });
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        isPublic: true,
        creatorId: true,
        contests: {
          select: {
            startTime: true,
            endTime: true,
            creatorId: true,
          }
        }
      },
      orderBy: {
        title: "asc",
      },
      skip,
      take: limit,
    }),
    prisma.problem.count({ where: whereClause })
  ]);

  return NextResponse.json({ 
    problems,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});
