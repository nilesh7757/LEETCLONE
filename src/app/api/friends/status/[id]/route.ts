import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ status: "NONE" });
  }

  const { id: targetUserId } = await params;

  if (targetUserId === session.user.id) {
    return NextResponse.json({ status: "SELF" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        following: { where: { id: targetUserId } }
      }
    });

    if (user?.following && user.following.length > 0) {
      return NextResponse.json({ status: "FOLLOWING" });
    }

    return NextResponse.json({ status: "NONE" });

  } catch (error: any) {
    console.error(`Check follow status error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}