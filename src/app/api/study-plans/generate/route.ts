import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePersonalizedStudyPlan } from "@/lib/services/studyPlanGenerator";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await generatePersonalizedStudyPlan(session.user.id);
    
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("[API_GENERATE_PLAN] Error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
