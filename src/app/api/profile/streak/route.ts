import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streak: true }
    });

    return NextResponse.json({ streak: user?.streak || 0 });
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
