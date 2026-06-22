import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const PUT = apiHandler(async (req: Request) => {
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { countryCode, avatarId } = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      countryCode: countryCode || undefined,
      avatarId: avatarId || undefined,
    },
  });

  return NextResponse.json({
      success: true,
      user: {
          countryCode: updatedUser.countryCode,
          avatarId: updatedUser.avatarId,
      }
  });
});
