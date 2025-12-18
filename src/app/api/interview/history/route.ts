import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const history = await prisma.mockInterview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        topic: true,
        difficulty: true,
        score: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("Interview History Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
