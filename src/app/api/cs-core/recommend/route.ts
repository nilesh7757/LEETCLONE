import { NextResponse } from "next/server";
import { runAI } from "@/lib/gemini";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RecommendSchema = z.object({
  topic: z.string().describe("A single, highly specific CS Core topic name (e.g. 'Thrashing in OS', 'B-Tree Indexing').")
});

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const pastWeaknesses = user?.aiProfileFeedback || "No weaknesses recorded yet. Suggest a foundational topic.";

  const prompt = `Based on the user's recorded weaknesses: "${pastWeaknesses}", recommend exactly ONE highly critical CS Core topic (from OS, DBMS, CN, or OOPS) they must learn next to pass a 10 LPA technical interview.`;

  const result = await runAI(prompt, "You are an elite placement coach.", RecommendSchema) as z.infer<typeof RecommendSchema>;

  return NextResponse.json({ topic: result.topic });
});
