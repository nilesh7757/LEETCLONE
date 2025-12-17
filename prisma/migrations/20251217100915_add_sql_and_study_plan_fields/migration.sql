-- AlterEnum
ALTER TYPE "ProblemType" ADD VALUE 'SQL';

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "initialData" TEXT,
ADD COLUMN     "initialSchema" TEXT;

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProblemToStudyPlan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlan_slug_key" ON "StudyPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_ProblemToStudyPlan_AB_unique" ON "_ProblemToStudyPlan"("A", "B");

-- CreateIndex
CREATE INDEX "_ProblemToStudyPlan_B_index" ON "_ProblemToStudyPlan"("B");

-- AddForeignKey
ALTER TABLE "_ProblemToStudyPlan" ADD CONSTRAINT "_ProblemToStudyPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemToStudyPlan" ADD CONSTRAINT "_ProblemToStudyPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
