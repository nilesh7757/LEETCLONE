import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTestCases } from "@/lib/testCaseGenerator";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId, language = "python" } = await req.json();

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem || !problem.referenceSolution) {
      return NextResponse.json({ error: "Problem or reference solution missing" }, { status: 400 });
    }

    const generatedSets = await generateTestCases(
      problem.title,
      problem.description,
      problem.difficulty,
      problem.category,
      problem.referenceSolution,
      language
    );

    // Save back to database
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        testSets: JSON.stringify({
          examples: generatedSets.examples,
          hidden: generatedSets.hidden
        })
      }
    });

    return NextResponse.json({ success: true, message: "Test cases generated and saved!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
