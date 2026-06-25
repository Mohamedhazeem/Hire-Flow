-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'super_admin';

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT;
