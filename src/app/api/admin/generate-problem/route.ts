
import { NextRequest, NextResponse } from "next/server";
import { ProblemArchitect } from "@/lib/agent/problemArchitect";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Assuming role check logic exists, e.g.:
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, difficulty } = await req.json();

    if (!topic || !difficulty) {
      return NextResponse.json({ error: "Topic and difficulty are required" }, { status: 400 });
    }

    const architect = new ProblemArchitect(topic, difficulty);
    const problemData = await architect.generate();

    return NextResponse.json({ success: true, data: problemData });
  } catch (error: any) {
    console.error("[ProblemArchitect] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate problem" },
      { status: 500 }
    );
  }
}
