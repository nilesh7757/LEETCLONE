-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "publishProblems" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;
