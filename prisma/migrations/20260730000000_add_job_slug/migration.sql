/*
  Warnings:

  - You are about to drop the column `slug` on the `Job` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
*/
-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Job_slug_key" ON "public"."Job"("slug");