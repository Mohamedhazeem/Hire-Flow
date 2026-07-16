-- DropForeignKey
ALTER TABLE "application_status_change" DROP CONSTRAINT "application_status_change_applicationId_fkey";

-- AlterTable
ALTER TABLE "application_status_change" ALTER COLUMN "applicationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "application_status_change" ADD CONSTRAINT "application_status_change_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "application_applied_at_idx" RENAME TO "application_appliedAt_idx";

-- RenameIndex
ALTER INDEX "application_job_id_applied_at_idx" RENAME TO "application_jobId_appliedAt_idx";
