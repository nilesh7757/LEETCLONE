import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        isPublic: true,
        createdAt: true,
        creator: {
            select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({ problems });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
