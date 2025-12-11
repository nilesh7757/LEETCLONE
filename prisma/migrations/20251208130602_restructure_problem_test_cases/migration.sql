/*
  Warnings:

  - You are about to drop the column `examples` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `testCases` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "examples",
DROP COLUMN "testCases",
ADD COLUMN     "testSets" JSONB NOT NULL DEFAULT '[]';
