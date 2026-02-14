import { NextResponse } from "next/server";
import { ProblemArchitect } from "@/lib/agent/problemArchitect";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new ApiError("Unauthorized", 401);
  }

  const { topic, difficulty } = await req.json();

  if (!topic || !difficulty) {
    throw new ApiError("Topic and difficulty are required", 400);
  }

  const architect = new ProblemArchitect(topic, difficulty);
  const problemData = await architect.generate();

  return NextResponse.json({ success: true, data: problemData });
});
