import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const topPlayers = await prisma.user.findMany({
    where: {
      arcadePoints: {
        gt: 0
      }
    },
    select: {
      id: true,
      name: true,
      image: true,
      arcadePoints: true
    },
    orderBy: {
      arcadePoints: "desc"
    },
    take: 10
  });

  return NextResponse.json(topPlayers);
});
