/*
  Warnings:

  - You are about to drop the `_ProblemToStudyPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProblemToStudyPlan" DROP CONSTRAINT "_ProblemToStudyPlan_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProblemToStudyPlan" DROP CONSTRAINT "_ProblemToStudyPlan_B_fkey";

-- AlterTable
ALTER TABLE "StudyPlan" ADD COLUMN     "durationDays" INTEGER;

-- DropTable
DROP TABLE "_ProblemToStudyPlan";

-- CreateTable
CREATE TABLE "StudyPlanProblem" (
    "id" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudyPlanProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminderTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StudyPlanEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanProblem_studyPlanId_problemId_key" ON "StudyPlanProblem"("studyPlanId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanEnrollment_userId_studyPlanId_key" ON "StudyPlanEnrollment"("userId", "studyPlanId");

-- AddForeignKey
ALTER TABLE "StudyPlanProblem" ADD CONSTRAINT "StudyPlanProblem_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanProblem" ADD CONSTRAINT "StudyPlanProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanEnrollment" ADD CONSTRAINT "StudyPlanEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanEnrollment" ADD CONSTRAINT "StudyPlanEnrollment_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
