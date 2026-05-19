import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        collaborators: {
            include: {
                user: { select: { name: true, email: true } }
            }
        },
        contests: {
            select: { id: true, collaborators: { select: { userId: true } } }
        }
      }
    });

    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

    // Authorization Check: Only Creator, Admin, or Collaborator (Problem or Contest) can fetch details
    const isAdmin = session.user.role === "ADMIN";
    const isCreator = problem.creatorId === session.user.id;
    const isProblemCollab = problem.collaborators.some(c => c.userId === session.user.id);
    const isContestCollab = problem.contests.some(ct => 
        ct.collaborators.some(cc => cc.userId === session.user.id)
    );

    if (!isAdmin && !isCreator && !isProblemCollab && !isContestCollab && !problem.isPublic) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ problem });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const problem = await prisma.problem.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

    // Only creator or admin can destroy a unit
    if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.problem.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Unit destroyed successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to destroy unit" }, { status: 500 });
  }
}
