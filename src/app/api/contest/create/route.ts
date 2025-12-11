import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, startTime, endTime, problemIds, publishProblems, visibility, accessCode } = await req.json();
    
    console.log("Creating contest. User:", session.user.id, "Data:", { title, description, startTime, endTime, problemIds, publishProblems, visibility });

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found in database. Please re-login." }, { status: 404 });
    }

    // Restriction: Only Admins can create PUBLIC contests
    if (visibility === "PUBLIC" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can create public contests. Please select Private." }, { status: 403 });
    }

    const contestData: any = {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      publishProblems: publishProblems ?? false,
      visibility: visibility || "PUBLIC",
      accessCode: visibility === "PRIVATE" ? null : accessCode, // Set to null if private
      creatorId: session.user.id,
    };

    if (problemIds && problemIds.length > 0) {
      contestData.problems = {
        connect: problemIds.map((id: string) => ({ id })),
      };
    }

    const contest = await prisma.contest.create({
      data: contestData,
    });

    return NextResponse.json({ contest });
  } catch (error: any) {
    console.error("Create contest error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
