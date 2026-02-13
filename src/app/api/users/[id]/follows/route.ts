import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "followers" or "following"

  if (type !== "followers" && type !== "following") {
      throw new ApiError("Invalid type", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      followedBy: type === "followers" ? {
        select: {
          id: true,
          name: true,
          image: true,
          rating: true,
          isBanned: true
        }
      } : false,
      following: type === "following" ? {
        select: {
          id: true,
          name: true,
          image: true,
          rating: true,
          isBanned: true
        }
      } : false
    }
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const users = type === "followers" ? user.followedBy : user.following;

  return NextResponse.json({ users });
});
