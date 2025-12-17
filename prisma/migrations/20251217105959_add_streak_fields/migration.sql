-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSolvedDate" TIMESTAMP(3),
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;
