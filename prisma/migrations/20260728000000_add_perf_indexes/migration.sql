-- Phase 1: Performance indexes for application list sort, job search, and trigram GIN
-- Generated: 2026-07-28

-- Application: sortBy support
CREATE INDEX CONCURRENTLY IF NOT EXISTS "application_status_idx" ON "application" ("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "application_jobId_status_appliedAt_idx" ON "application" ("jobId", "status", "appliedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_updatedAt_idx" ON "job" ("updatedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_viewCount_idx" ON "job" ("viewCount");

-- Composite index for recruiter/admin job list filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_companyId_status_isActive_idx" ON "job" ("companyId", "status", "isActive");

-- Trigram GIN indexes for contains + mode: insensitive search patterns
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_name_trgm_idx" ON "user" USING GIN (name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_email_trgm_idx" ON "user" USING GIN (email gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_title_trgm_idx" ON "job" USING GIN (title gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_description_trgm_idx" ON "job" USING GIN (description gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "company_name_trgm_idx" ON "company" USING GIN (name gin_trgm_ops);

-- GIN index for skills hasSome array overlap queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_skills_gin_idx" ON "job" USING GIN ("skills");

-- FTS GIN indexes using 'simple' config (matches Prisma fullTextSearchPostgres search operator behavior)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_title_fts_simple_idx" ON "job" USING GIN (to_tsvector('simple', coalesce("title", '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "job_description_fts_simple_idx" ON "job" USING GIN (to_tsvector('simple', coalesce("description", '')));
