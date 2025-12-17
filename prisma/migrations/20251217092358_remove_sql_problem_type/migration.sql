/*
  Warnings:

  - The values [SQL] on the enum `ProblemType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `sqlExpectedOutput` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `sqlSchema` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `sqlSetupData` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `sqlVerificationQuery` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProblemType_new" AS ENUM ('CODING', 'SHELL', 'INTERACTIVE', 'SYSTEM_DESIGN');
ALTER TABLE "Problem" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Problem" ALTER COLUMN "type" TYPE "ProblemType_new" USING ("type"::text::"ProblemType_new");
ALTER TYPE "ProblemType" RENAME TO "ProblemType_old";
ALTER TYPE "ProblemType_new" RENAME TO "ProblemType";
DROP TYPE "ProblemType_old";
ALTER TABLE "Problem" ALTER COLUMN "type" SET DEFAULT 'CODING';
COMMIT;

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "sqlExpectedOutput",
DROP COLUMN "sqlSchema",
DROP COLUMN "sqlSetupData",
DROP COLUMN "sqlVerificationQuery";
