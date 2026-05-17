import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const SiegePlanSchema = z.object({
  target: z.string(),
  rationale: z.string(),
  weeks: z.array(z.object({
    week: z.union([z.number(), z.string().transform(v => parseInt(v))]), // Handle string weeks
    topic: z.string(),
    description: z.string(),
    tasks: z.array(z.object({
      title: z.string(),
      difficulty: z.string(),
      type: z.string().transform(v => {
          const val = v.toUpperCase();
          if (val.includes("PROB")) return "PROBLEM";
          if (val.includes("CONC")) return "CONCEPT";
          if (val.includes("PROJ")) return "PROJECT";
          return "CONCEPT"; // Default fallback
      }),
      link: z.string().optional().nullable()
    }))
  }))
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetCompany } = await req.json();
    if (!targetCompany) return NextResponse.json({ error: "Target company required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        externalStats: true,
        devPowerLevel: true,
        aiProfileFeedback: true,
        skills: true
      }
    });

    if (!user || !user.externalStats) {
      return NextResponse.json({ error: "Please sync your Omni-Profile first" }, { status: 400 });
    }

    const aiPrompt = `
      USER PROFILE CONTEXT:
      - Power Level: ${user.devPowerLevel}
      - Skills: ${user.skills.join(", ")}
      - External Stats: ${JSON.stringify(user.externalStats)}
      - Current Coach Advice: ${user.aiProfileFeedback}
      
      MISSION OBJECTIVE:
      Generate a 4-week "Targeted Siege" roadmap to crack the technical interview at: ${targetCompany}.
      
      REQUIREMENTS:
      1. Analyze the user's weaknesses (e.g., if their Codeforces rating is high but LeetCode is low, focus on standard patterns. If both are high, focus on advanced system design).
      2. Tailor the tasks to ${targetCompany}'s specific interview style (e.g., Google values graph theory/dynamic programming, Atlassian values system design/clean code).
      3. For each week, provide 3-5 specific tasks or problem titles.
      
      Response must be in JSON format matching the SiegePlanSchema.
    `;

    const aiResult = await runAI(
      aiPrompt,
      "You are the High-Command Strategist. You curate brutal but effective placement roadmaps using deep intelligence.",
      SiegePlanSchema,
      false // Use heavy model (Llama 405B) for better roadmap quality
    );

    // CRITICAL: Re-validate to ensure we don't save a mangled raw object if AI_PARSE_ERROR occurred
    const validatedPlan = SiegePlanSchema.safeParse(aiResult);
    if (!validatedPlan.success) {
      console.error("AI Schema Mismatch:", validatedPlan.error);
      return NextResponse.json({ 
        error: "Strategic calculation produced invalid data. Please try again." 
      }, { status: 500 });
    }

    // Save the plan to DB
    const plan = await prisma.siegePlan.create({
      data: {
        userId: session.user.id,
        targetCompany: targetCompany,
        planData: validatedPlan.data as Prisma.InputJsonValue
      }
    });

    return NextResponse.json({ success: true, planId: plan.id, plan: validatedPlan.data });

  } catch (error: unknown) {
    console.error("Siege Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate siege roadmap" }, { status: 500 });
  }
}
