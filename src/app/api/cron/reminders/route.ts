import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStudyReminderEmail } from "@/lib/mail";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  // Security: Check for Cron Secret if in production
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    logger.info(`[CRON] Running study reminders for ${currentTime}`);

    // 1. Find enrollments with a reminder set for right now
    const enrollments = await prisma.studyPlanEnrollment.findMany({
      where: {
        isActive: true,
        reminderTime: currentTime,
      },
      include: {
        user: { select: { email: true } },
        studyPlan: {
          include: {
            problems: {
              include: {
                problem: {
                  select: {
                    submissions: true // We'll need to check if these are by the specific user
                  }
                }
              }
            }
          }
        }
      }
    });

    logger.info(`[CRON] Found ${enrollments.length} users to remind.`);

    for (const enrollment of enrollments) {
      if (!enrollment.user.email) continue;

      // Calculate progress specifically for this user
      const problems = enrollment.studyPlan.problems;
      const total = problems.length;
      
      // Check for accepted submissions by this specific user
      const solved = await prisma.submission.count({
          where: {
              userId: enrollment.userId,
              status: "Accepted",
              problemId: { in: problems.map(p => p.problemId) }
          }
      });

      const progress = total > 0 ? Math.round((solved / total) * 100) : 0;

      await sendStudyReminderEmail(
        enrollment.user.email,
        enrollment.studyPlan.title,
        progress
      );
      
      logger.info(`[CRON] Reminder sent to ${enrollment.user.email}`);
    }

    // 2. Delete temporary guest users older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deletedGuests = await prisma.user.deleteMany({
      where: {
        description: "Temporary Guest Account",
        createdAt: { lt: oneDayAgo }
      }
    });
    logger.info(`[CRON] Cleaned up ${deletedGuests.count} guest accounts older than 24 hours.`);

    return NextResponse.json({
      success: true,
      processedReminders: enrollments.length,
      deletedGuests: deletedGuests.count
    });
  } catch (error) {
    logger.error("[CRON ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
