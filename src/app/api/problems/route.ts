import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await auth();
    const userId = session?.user?.id;

    // Parse filters
    const currentTab = searchParams.get("tab") === "mine" ? "mine" : searchParams.get("tab") === "sql" ? "sql" : "public";
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 8; // Exactly 8 problems per page as requested
    const skip = (currentPage - 1) * pageSize;

    const whereClause: Prisma.ProblemWhereInput = {};
    if (currentTab === "mine" && userId) {
      whereClause.creatorId = userId;
    } else {
      whereClause.OR = [
        { isPublic: true },
        { contests: { some: { endTime: { lte: new Date() }, publishProblems: true } } }
      ];
      
      if (currentTab === "sql") {
        whereClause.type = "SQL";
      } else {
        whereClause.type = "CODING";
      }
    }

    const search = searchParams.get("search");
    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' as Prisma.QueryMode };
    }

    const difficulty = searchParams.get("difficulty");
    if (difficulty && difficulty !== "All") {
      whereClause.difficulty = difficulty;
    }

    const category = searchParams.get("category");
    if (category && category !== "All") {
      if (category === "Arrays & Hashing") {
        whereClause.category = { in: ["Arrays & Hashing", "Array", "Arrays"] };
      } else if (category === "Math & Geometry") {
        whereClause.category = { in: ["Math & Geometry", "Math", "Geometry"] };
      } else if (category === "1-D DP" || category === "2-D DP") {
        whereClause.category = { in: [category, "Dynamic Programming", "DP"] };
      } else if (category === "Trees") {
        whereClause.category = { in: ["Trees", "Tree"] };
      } else if (category === "Graphs" || category === "Advanced Graphs") {
        whereClause.category = { in: ["Graphs", "Graph", "Advanced Graphs"] };
      } else {
        whereClause.category = category;
      }
    }

    const company = searchParams.get("company");
    if (company && company !== "All") {
      whereClause.companies = {
        has: company
      };
    }

    const starred = searchParams.get("starred") === "true";
    if (starred && userId) {
      whereClause.starredBy = {
        some: {
          userId
        }
      };
    }

    // Query database
    const [problems, totalCount] = await prisma.$transaction([
      prisma.problem.findMany({
        where: whereClause as Prisma.ProblemWhereInput,
        include: {
          submissions: {
            select: {
              status: true
            }
          },
          ...(userId ? {
            starredBy: {
              where: { userId },
              select: { id: true }
            }
          } : {})
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.problem.count({ where: whereClause as Prisma.ProblemWhereInput })
    ]);

    // Map solved and attempted statuses
    const solvedProblemIds = new Set<string>();
    const attemptedProblemIds = new Set<string>();

    if (userId) {
      const allSubmissions = await prisma.submission.findMany({
        where: {
          userId: userId,
          problemId: { in: problems.map(p => p.id) }
        },
        select: { problemId: true, status: true },
      });

      allSubmissions.forEach(sub => {
        attemptedProblemIds.add(sub.problemId);
        if (sub.status === "Accepted") {
          solvedProblemIds.add(sub.problemId);
        }
      });
    }

    const mappedProblems = problems.map(problem => {
      const total = problem.submissions.length;
      let rateStr = "";
      if (total > 0) {
        const accepted = problem.submissions.filter(s => s.status === "Accepted").length;
        rateStr = ((accepted / total) * 100).toFixed(1);
      } else {
        const titleSum = problem.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const diff = problem.difficulty;
        if (diff === "Easy") {
          rateStr = ((titleSum % 20) + 65.4).toFixed(1);
        } else if (diff === "Medium") {
          rateStr = ((titleSum % 15) + 43.1).toFixed(1);
        } else {
          rateStr = ((titleSum % 15) + 22.7).toFixed(1);
        }
      }

      return {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        category: problem.category,
        isSolved: solvedProblemIds.has(problem.id),
        isAttempted: attemptedProblemIds.has(problem.id) && !solvedProblemIds.has(problem.id),
        isStarred: userId ? ((problem as any).starredBy?.length ?? 0) > 0 : false,
        acceptanceRate: rateStr,
        companyTags: problem.companyTags || [],
      };
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      problems: mappedProblems,
      totalPages,
      totalCount,
      hasMore: currentPage < totalPages
    });
  } catch (error) {
    console.error("Error in problems API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
