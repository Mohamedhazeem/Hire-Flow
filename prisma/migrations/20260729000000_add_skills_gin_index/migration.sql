CREATE INDEX IF NOT EXISTS idx_job_skills_gin ON "Job" USING GIN (skills);
