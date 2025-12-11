import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          isBanned: false,
        },
        select: {
          id: true,
          name: true,
          image: true,
          rating: true,
          _count: {
            select: {
              submissions: {
                where: {
                  status: "Accepted"
                }
              }
            }
          }
        },
        orderBy: [
          { rating: "desc" },
          { name: "asc" } // Tie-breaker
        ],
        take: limit,
        skip: skip,
      }),
      prisma.user.count({
        where: {
            isBanned: false
        }
      })
    ]);

    // Format the response
    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      id: user.id,
      name: user.name || "Anonymous",
      image: user.image,
      rating: user.rating,
      solvedCount: user._count.submissions,
    }));

    return NextResponse.json({ 
        leaderboard,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
