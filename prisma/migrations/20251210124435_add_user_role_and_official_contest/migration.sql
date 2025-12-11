-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';
