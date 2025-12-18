import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        creator: { select: { id: true, name: true } }
      }
    });

    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

    // Authorization Check: Only Creator or Admin can fetch details
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = problem.creatorId === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ problem });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}