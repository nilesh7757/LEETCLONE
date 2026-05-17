import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { socketClient } from "@/lib/socket-client";

// GET /api/contest/[id]/announcements
export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  
  const announcements = await prisma.announcement.findMany({
    where: { contestId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ announcements });
});

// POST /api/contest/[id]/announcements
export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const contest = await prisma.contest.findUnique({
    where: { id },
  });

  if (!contest) {
    throw new ApiError("Contest not found", 404);
  }

  // Only creator or ADMIN can broadcast
  if (contest.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden", 403);
  }

  const { message } = await req.json();

  if (!message) {
    throw new ApiError("Message is required", 400);
  }

  const announcement = await prisma.announcement.create({
    data: {
      message,
      contestId: id,
    },
  });

  // Broadcast via Socket.io
  socketClient.connect();
  const socket = socketClient.socket;
  if (socket) {
      socket.emit("contest_announcement", { 
          contestId: id, 
          announcement 
      });
  }

  return NextResponse.json({ announcement }, { status: 201 });
});
