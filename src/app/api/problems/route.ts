import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  // Optionally restrict problem creation to authenticated users, or admins
  // For now, let anyone see problems for selection.

  try {
    const whereClause: any = {
      OR: [
        { isPublic: true },
        { contests: { some: { endTime: { lte: new Date() }, publishProblems: true } } }
      ]
    };

    if (userId) {
      whereClause.OR.push({ creatorId: userId });
    }

    const problems = await prisma.problem.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        difficulty: true,
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
    });
    
    // We don't need aggressive JS filtering anymore because the DB query handles visibility permissions.
    // However, we might want to sanitize the 'contests' field if strictly necessary, but for 'Create Contest' dropdown it's fine.
    // Let's just return them.

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Failed to fetch problems:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
