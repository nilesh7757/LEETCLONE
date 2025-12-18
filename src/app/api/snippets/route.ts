import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language");

  try {
    const snippets = await prisma.snippet.findMany({
      where: {
        userId: session.user.id,
        ...(language ? { language } : {}),
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ snippets });
  } catch (error) {
    console.error("Fetch snippets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, code, language } = await req.json();

    if (!title || !code || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ snippet });
  } catch (error) {
    console.error("Create snippet error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
