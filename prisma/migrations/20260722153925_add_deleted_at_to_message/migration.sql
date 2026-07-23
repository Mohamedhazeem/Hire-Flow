-- AlterTable
ALTER TABLE "message" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "hiddenFor" TEXT[] DEFAULT ARRAY[]::TEXT[];
