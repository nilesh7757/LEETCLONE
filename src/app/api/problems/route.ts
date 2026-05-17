import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { Prisma } from "@prisma/client";

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  const userId = session?.user?.id;
  
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "200"); // Allow more for the bank
  const tab = searchParams.get("tab");
  const foundry = searchParams.get("foundry") === "true";
  const skip = (page - 1) * limit;

  let whereClause: Prisma.ProblemWhereInput = {};

  if (tab === "mine" && userId) {
    // Show all user-created problems (bank mode)
    whereClause = {
      creatorId: userId
    };
  } else if (foundry && userId) {
    // Foundry mode: private units only
    whereClause = {
      creatorId: userId,
      isPublic: false
    };
  } else {
    // Public mode
    whereClause = {
      OR: [
        { isPublic: true },
        { contests: { some: { endTime: { lte: new Date() } } } }
      ]
    };
    if (userId) {
      whereClause.OR?.push({ creatorId: userId });
    }
  }

  // Apply search query if present
  if (query) {
    whereClause = {
      AND: [
        whereClause,
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ]
        }
      ]
    };
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
        updatedAt: true,
        isVerified: true,
        verificationStatus: true,
        type: true,
        testSets: true,
        referenceSolution: true,
        contests: {
          select: {
            startTime: true,
            endTime: true,
            creatorId: true,
          }
        }
      },
      orderBy: {
        updatedAt: "desc",
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
