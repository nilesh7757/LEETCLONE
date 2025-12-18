-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "auditFeedback" TEXT,
ADD COLUMN     "auditPassed" BOOLEAN DEFAULT true;
