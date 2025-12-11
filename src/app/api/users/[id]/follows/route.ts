import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "followers" or "following"

  if (type !== "followers" && type !== "following") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        [type === "followers" ? "followedBy" : "following"]: {
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

    const users = type === "followers" ? user.followedBy : user.following;

    return NextResponse.json({ users });

  } catch (error: any) {
    console.error("Failed to fetch follows:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
