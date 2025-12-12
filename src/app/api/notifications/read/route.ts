import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: session.user.id, // Ensure ownership
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark notifications read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
