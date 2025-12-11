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

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            following: {
                disconnect: { id: targetId }
            }
        }
    });

    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
