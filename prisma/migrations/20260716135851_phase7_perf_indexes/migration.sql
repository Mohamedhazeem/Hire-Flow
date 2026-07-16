-- Phase 7: Performance indexes for analytics, applicant list, and full-text search
-- Generated: 2026-07-16

-- Application: composite index on jobId+appliedAt for analytics date-range filtering
-- and applicant list ordering by appliedAt
CREATE INDEX CONCURRENTLY IF NOT EXISTS "application_applied_at_idx" ON "application" ("appliedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "application_job_id_applied_at_idx" ON "application" ("jobId", "appliedAt");

-- Job: GIN full-text search indexes for Prisma's `.search` operator
-- Prisma's fullTextSearchPostgres preview feature emits:
--   to_tsvector('english', "title") @@ to_tsquery('english', ...)
-- These GIN indexes accelerate that predicate per field.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_title_fts_idx" ON "job" USING gin (to_tsvector('english', "title"));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_description_fts_idx" ON "job" USING gin (to_tsvector('english', "description"));
