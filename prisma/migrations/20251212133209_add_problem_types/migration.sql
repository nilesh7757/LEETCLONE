-- CreateEnum
CREATE TYPE "ProblemType" AS ENUM ('CODING', 'SQL', 'SHELL', 'INTERACTIVE', 'SYSTEM_DESIGN');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "sqlExpectedOutput" JSONB,
ADD COLUMN     "sqlSchema" TEXT,
ADD COLUMN     "sqlSetupData" TEXT,
ADD COLUMN     "sqlVerificationQuery" TEXT,
ADD COLUMN     "type" "ProblemType" NOT NULL DEFAULT 'CODING';
