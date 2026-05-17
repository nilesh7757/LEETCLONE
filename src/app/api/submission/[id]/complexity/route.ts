import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { predictComplexity } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { id: true, code: true, language: true, userId: true }
  });

  if (!submission) throw new ApiError("Submission not found", 404);
  if (submission.userId !== session.user.id) throw new ApiError("Forbidden", 403);

  logger.info(`[Complexity API] Analyzing submission ${id}`);
  
  // Use the new, structured predictComplexity function
  const { timeComplexity, spaceComplexity } = await predictComplexity(submission.code, submission.language);

  await prisma.submission.update({
    where: { id },
    data: { timeComplexity, spaceComplexity }
  });

  return NextResponse.json({ success: true, timeComplexity, spaceComplexity });
});
