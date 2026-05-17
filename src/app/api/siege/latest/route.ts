import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latestPlan = await prisma.siegePlan.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ plan: latestPlan });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch latest plan" }, { status: 500 });
  }
}
