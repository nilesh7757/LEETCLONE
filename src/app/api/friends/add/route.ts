import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetId } = await req.json();

    if (targetId === session.user.id) {
        return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            following: {
                connect: { id: targetId }
            }
        }
    });

    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
