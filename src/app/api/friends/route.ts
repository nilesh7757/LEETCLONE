import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
            isBanned: true
          }
        }
      }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ friends: user.following });
  } catch (error) {
    console.error("Fetch following error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}