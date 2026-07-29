CREATE INDEX IF NOT EXISTS idx_job_skills_gin ON "job" USING GIN (skills);
