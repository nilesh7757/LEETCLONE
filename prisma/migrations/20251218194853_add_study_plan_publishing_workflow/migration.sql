-- AlterTable
ALTER TABLE "StudyPlan" ADD COLUMN     "pendingData" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "isPublic" SET DEFAULT false;
