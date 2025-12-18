-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "hints" TEXT[] DEFAULT ARRAY[]::TEXT[];
