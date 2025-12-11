import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params; // commentId
  const { type } = await req.json(); // "UP" or "DOWN"

  try {
      // Check existing vote
      const existingVote = await prisma.commentVote.findUnique({
          where: {
              userId_commentId: {
                  userId: session.user.id,
                  commentId: id
              }
          }
      });

      if (existingVote) {
          if (existingVote.type === type) {
              // Toggle off (remove vote)
              await prisma.commentVote.delete({ where: { id: existingVote.id } });
          } else {
              // Change vote
              await prisma.commentVote.update({
                  where: { id: existingVote.id },
                  data: { type }
              });
          }
      } else {
          // Create vote
          await prisma.commentVote.create({
              data: {
                  userId: session.user.id,
                  commentId: id,
                  type
              }
          });
      }

      // Fetch updated counts
      const votes = await prisma.commentVote.findMany({
          where: { commentId: id }
      });

      const upvotes = votes.filter(v => v.type === "UP").length;
      const downvotes = votes.filter(v => v.type === "DOWN").length;
      
      return NextResponse.json({ success: true, upvotes, downvotes });
  } catch (error) {
      console.error("Failed to vote:", error);
      return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
