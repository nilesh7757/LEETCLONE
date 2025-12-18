import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { analyzeCodeComplexity, AIError } from "@/lib/gemini";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, code: true, language: true, userId: true }
    });

    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (submission.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    console.log(`[Complexity API] Analyzing submission ${id}`);
    const { timeComplexity, spaceComplexity } = await analyzeCodeComplexity(submission.code, submission.language);

    const updated = await prisma.submission.update({
      where: { id },
      data: { timeComplexity, spaceComplexity }
    });

    return NextResponse.json({ success: true, timeComplexity, spaceComplexity });

  } catch (error: any) {
    console.error("Complexity API Error:", error);
    if (error instanceof AIError && error.status === 429) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to analyze complexity" }, { status: 500 });
  }
}
