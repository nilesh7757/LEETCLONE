import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
    });

    if (!snippet || snippet.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.snippet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete snippet error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
