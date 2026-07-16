-- Phase 7: AI-enhance daily quota table for concurrency-safe rate limiting.
-- Generated: 2026-07-16
CREATE TABLE IF NOT EXISTS "resume_enhancement_quota" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "used" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "resume_enhancement_quota_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "resume_enhancement_quota_userId_day_key"
  ON "resume_enhancement_quota" ("userId", "day");
