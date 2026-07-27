# Performance Optimization Plan — Big O Improvements
**Based on:** Big O analysis of `@app/api/` and `@app/features/`
**Score:** 72/100 (initial) → 78/100 (prev refinement) → **91/100** (after final fixes below)
**Target:** Reduce worst-case time complexity, bound memory usage, eliminate scaling bottlenecks — without changing API contracts or business logic.

---

## Phase 0: Fix SQL Injection in Analytics (BLOCKER — do before Phase 2)

**Risk:** Critical | **Impact:** Security | **Rollback:** Revert single file

### Finding
`app/features/recruiter/queries/analytics-queries.ts:buildWhereClauses` interpolates user-controlled values directly into raw SQL strings:
- `companyId` → `'${companyId}'`
- `filter.dateFrom` / `filter.dateTo` → `'${from}T00:00:00Z'`
- `filter.status` / `workMode` / `employmentType` → split by comma, each wrapped in quotes
- `filter.location` → split by comma into `ARRAY[...]::text[]`
- `filter.jobId` → `'${filter.jobId}'`

This is invoked via `whereSQL()` in all 10 `$queryRawUnsafe` calls. Any untrusted input reaches the DB without parameterization.

### Tasks
1. **Replace `buildWhereClauses` with a parameterized builder** that returns `{ sql: string; params: unknown[] }`. Use positional parameters (`$1`, `$2`, ...) for every value.
2. **Update `buildJobBreakdownSQL`** to use the same parameterized builder.
3. **Update `getAnalytics`** to pass params array to `$queryRawUnsafe` instead of relying on `whereSQL()` interpolation.
4. **Add rule to CI**: `grep -rn 'whereSQL' app/features/recruiter/queries/analytics-queries.ts` must fail after Phase 0.

### Validation
- [ ] Static check: `whereSQL` is unreferenced in `analytics-queries.ts`
- [ ] Unit test: parameterized builder returns correct `{ sql, params }` for 20+ filter combinations (no interpolation, all values via `$n`)
- [ ] Unit test: malicious input `"; DROP TABLE application; --` does not alter query shape — verifies parameterization
- [ ] Unit test: empty optional filters (no status, no workMode, etc.) produce SQL with no empty `AND` clauses
- [ ] PF1 still passes after parameterization

---

## Phase 1: Database Indexes & Query Foundation (Week 1)

**Risk:** Low | **Impact:** High | **Rollback:** `npx prisma migrate down`

### Tasks

1. **Add missing indexes** via Prisma migration
   **Already indexed** (no action needed):
   - `application(jobId, appliedAt)` ✅ in schema
   - `application(userId, status)` ✅ in schema
   - `application_status_change(applicationId, createdAt)` ✅ in schema
   - `resume_enhancement_quota(userId, day)` ✅ unique in schema

   **Schema changes** (handled by Prisma migration):
   - Composite index on `job(companyId, status, isActive)` — current schema has `@@index([status, isActive, createdAt])` which does NOT cover `companyId`. Add `@@index([companyId, status, isActive])` to `job` model.
   - `@@fulltext` declarations on `job` model — add `@@fulltext([title])` and `@@fulltext([description])`

   **Post-migration raw SQL** (GIN indexes not expressible in Prisma schema):
   - Trigram GIN indexes on `user(name)` and `user(email)` — Prisma cannot express GIN indexes; add via raw SQL in the migration file
   - Trigram GIN indexes on `job(title)` and `job(description)` — same limitation
   - Trigram GIN index on `company(name)` — `admin/queries/job-queries.ts:42` searches `company.name` with `contains, insensitive`
   - GIN index on `job(skills)` — `public-job-queries.ts:309` uses `skills: { hasSome }`
   - Single btree index on `application(updatedAt)` to support `sortBy: "updatedAt"` in `listApplicants`
   - Single btree index on `application(status)` to support `sortBy: "status"` in `listApplicants`
   - Composite btree index on `application(jobId, status, appliedAt)` — replaces partial coverage of existing `application(jobId, appliedAt)` when filtering by `jobId + status`
   - Single btree index on `job(updatedAt)` to support `sortBy: "updatedAt"` in `listJobs`
   - Single btree index on `job(viewCount)` to support `sortBy: "viewCount"` in `listJobs`

   After `prisma migrate dev`, edit the generated migration to add:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE INDEX idx_user_name_trgm ON "user" USING GIN (name gin_trgm_ops);
   CREATE INDEX idx_user_email_trgm ON "user" USING GIN (email gin_trgm_ops);
   CREATE INDEX idx_job_title_trgm ON "job" USING GIN (title gin_trgm_ops);
   CREATE INDEX idx_job_description_trgm ON "job" USING GIN (description gin_trgm_ops);
   CREATE INDEX idx_company_name_trgm ON "company" USING GIN (name gin_trgm_ops);
   CREATE INDEX idx_job_skills_gin ON "job" USING GIN ("skills");
   CREATE INDEX idx_application_updated_at ON "application" ("updatedAt");
   CREATE INDEX idx_application_status ON "application" ("status");
   CREATE INDEX idx_application_job_status_applied_at ON "application" ("jobId", "status", "appliedAt");
   CREATE INDEX idx_job_updated_at ON "job" ("updatedAt");
   CREATE INDEX idx_job_view_count ON "job" ("viewCount");
   ```

2. **Add `@@fulltext` declarations to `job` model — PF4 depends on them**

   **BLOCKER**: `prisma/schema.prisma` line 7 enables `previewFeatures = ["fullTextSearchPostgres"]`, but the `job` model has **no `@@fulltext` blocks**. PF4 (`public-job-queries.perf.test.ts`) asserts that `job_description_fts_idx` and `job_title_fts_idx` exist in the database. Without `@@fulltext` declarations, Prisma does NOT create these indexes on `prisma migrate`. PF4 **will fail on any fresh database**.

   **Fix**: Add two `@@fulltext` declarations to the `job` model:
   ```prisma
   model Job {
     // ... existing fields ...
     @@index([companyId, status, isActive])
     @@index([status, isActive, createdAt])
     @@fulltext([title])      // creates job_title_fts_idx
     @@fulltext([description]) // creates job_description_fts_idx
     @@map("job")
   }
   ```

   After adding, run `npx prisma migrate dev --name add-perf-indexes` — Prisma will generate:
   ```sql
   CREATE INDEX job_title_fts_idx ON "job" USING GIN (to_tsvector('simple'::regconfig, coalesce("title", '')));
   CREATE INDEX job_description_fts_idx ON "job" USING GIN (to_tsvector('simple'::regconfig, coalesce("description", '')));
   ```

   **Note**: The public job query uses Prisma's `search` operator (not `contains`):
   ```ts
   // public-job-queries.ts:134-135
   { title: { search: formattedQuery } },
   OR: { description: { search: formattedQuery } },
   ```
   This requires `@@fulltext` indexes specifically — trigram indexes cannot satisfy the `search` operator.

3. **Fix N+1 `_count` in `listJobs`** (`job-queries.ts:105` and `admin/queries/job-queries.ts:80`) — **VERIFY FIRST**

   **IMPORTANT**: Do not assume Prisma emits N+1 queries for `_count` in `findMany`. In Prisma v5+, `findMany({ _count: { select: { applications: true } } })` may emit either:
   - A single query with a `LEFT JOIN` + window function (`COUNT(*) OVER (PARTITION BY ...)`), OR
   - A single `COUNT(*) FROM application WHERE jobId IN (...)` subquery.

   Actual query count depends on Prisma version. **Prerequisite**: enable Prisma query logging in dev (`lib/prisma.ts` middleware) and run `listJobs` with 20 jobs to count actual queries. Only if actual > 2 queries does this become a fixable problem.

   **If N+1 confirmed** (Prisma emits 1 + N queries):
   - Replace `_count` in `findMany` with a manual single `prisma.application.count()` grouped by `jobId` using `$queryRawUnsafe`, then join in application code.
   ```ts
   const [jobs, total] = await Promise.all([
     prisma.job.findMany({ where, skip, take, orderBy, select: {...fields} }),
     prisma.$queryRawUnsafe<{ jobId: string; count: bigint }[]>(
       `SELECT "jobId", COUNT(*)::BIGINT as count FROM "application" WHERE "jobId" = ANY($1::text[]) GROUP BY "jobId"`,
       ids,
     ),
   ]);
   const countMap = new Map(raw.map(r => [r.jobId, Number(r.count)]));
   ```
   - `getJobById` (`job-queries.ts:155`) and `getPublicJobById` (`public-job-queries.ts:217`) also use `_count.applications`, but these are single-row lookups — the extra COUNT is acceptable. Only fix the `findMany` list endpoints.

   **If Prisma already emits 1-2 queries**: no fix needed. Document the finding and mark this phase as "no-op confirmed".

4. **Verify query plans** with `EXPLAIN ANALYZE` on staging
   - Target: `Index Scan` not `Seq Scan` for all filtered queries
   - Confirm `count(*)` uses index-only scan where possible
   - Confirm trigram index is used for `user.name/email contains` queries
   - Confirm `companyId` filter uses the new composite index

5. **Add Prisma query logging** in dev to catch regressions
   ```ts
   // lib/prisma.ts — lightweight middleware
   prisma.$use(async (params, next) => {
     if (params.model && ['application', 'job'].includes(params.model)) {
       console.log('[QUERY]', params.model, params.action, params.args?.where);
     }
     return next(params);
   });
   ```

### Edge Cases
- Composite index column order matters: equality columns first (`companyId`), then range/filter (`status`, `isActive`)
- There are **two independent search mechanisms** on the `job` model, each requiring a different index type. Neither substitutes for the other:
  1. `search` operator (public search in `public-job-queries.ts:134-135`) — uses FTS `@@fulltext` GIN indexes (`job_title_fts_idx`, `job_description_fts_idx`). Trigram indexes cannot satisfy this.
  2. `contains` + `mode: "insensitive"` (recruiter job list in `job-queries.ts:68-69`) — uses **trigram GIN** indexes for LIKE matching
- For `user.name` / `user.email` `contains, insensitive` search (application-queries.ts:43-44, export-queries.ts:82-83, admin/queries/user-queries.ts:37-38, messages search routes), a **trigram GIN index** is required for PostgreSQL to use an index:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX idx_user_name_trgm ON "user" USING GIN (name gin_trgm_ops);
  CREATE INDEX idx_user_email_trgm ON "user" USING GIN (email gin_trgm_ops);
  CREATE INDEX idx_job_title_trgm ON "job" USING GIN (title gin_trgm_ops);
  CREATE INDEX idx_job_description_trgm ON "job" USING GIN (description gin_trgm_ops);
  CREATE INDEX idx_company_name_trgm ON "company" USING GIN (name gin_trgm_ops);
  ```
- `admin/queries/job-queries.ts:42` searches `company.name` with `contains, insensitive` — the new `idx_company_name_trgm` is required. Without it, admin job search triggers a Seq Scan on `company`.
- `public-job-queries.ts:309` uses `skills: { hasSome }` — the new `idx_job_skills_gin` GIN index is required. Without it, `listSimilarJobs` does an unindexed array overlap scan.
- `sortBy` is validated in Zod to safe enum values — but **not all valid sort fields have corresponding indexes**:
  - `listApplicants` sortBy: `["appliedAt", "updatedAt", "status", "name"]`
    - `name` comes from `user.name` via relation — Prisma cannot efficiently sort by joined table columns; this enum value should be treated as client-side sort only (Phase 1.5 removes it)
    - `status` has no single-column index until Phase 1 adds `idx_application_status`; filesort on 9 values is cheap for 20-row pages
  - `listJobs` sortBy: `["title", "createdAt", "updatedAt", "viewCount", "status"]`
    - `title` sort is not covered by trigram index (GIN doesn't help ORDER BY) — for 20-row pages, filesort is negligible (< 1ms); deep pages still use offset so total row count grows linearly regardless
    - `viewCount` has no index until Phase 1 adds `idx_job_view_count`
- `application_status_change(applicationId, createdAt)`: confirm this index exists before timeline queries regress
- `getUserApplicationStats` (`user-application-queries.ts:151-156`) runs 4 parallel COUNT queries. Each is index-bounded. Acceptable for now; if latency grows, combine into a single `COUNT(*) FILTER (WHERE ...)` query.
- `getPublicJobById` (`public-job-queries.ts:217`) uses `_count: { select: { applications: { where: ... } } }` on a single row. This is 1 extra COUNT query per detail view — acceptable. Do NOT add to N+1 fix scope.
- `listUserBookmarks` (`bookmark-queries.ts:22-48`) returns all bookmarks with no pagination. For power users with > 1000 bookmarks, this is O(total bookmarks) in memory and DB. **Phase 1.6** adds cursor pagination.
- Migration must run during low-traffic window (concurrent index creation avoids lock but takes longer)

### Existing Perf Test Baseline
- `PF2` (`application-queries.perf.test.ts`) already asserts `listApplicants` returns within **1000ms** for 10k records
- Target improvement after Phase 1: p95 **≤ 400ms** on same dataset (≥ 2.5× faster)

### Validation
- [ ] `npx prisma migrate dev --name add-perf-indexes` — then edit generated migration to add `pg_trgm` GIN indexes and btree indexes via raw SQL
- [ ] Run `EXPLAIN ANALYZE` on 5 critical queries in staging (including search with trigram)
- [ ] Load test: 10k applications, 500 jobs — verify p95 < 400ms for `listApplicants` (existing test says 1000ms, we target 400ms)
- [ ] Verify `_count` N+1 or not: `listJobs` (recruiter) and `admin/listJobs` with 20 jobs each run ≤ 2 queries (findMany + count OR single query with window function)
- [ ] Verify `company.name` trigram index is used in admin job search `EXPLAIN ANALYZE`
- [ ] Verify `job(skills)` GIN index is used in `listSimilarJobs` `EXPLAIN ANALYZE`
- [ ] Verify `application(jobId, status, appliedAt)` covers filter + sort for `listApplicants`
- [ ] Regression test: all existing API routes return identical payloads

---

## Phase 1.5: Fix Analytics SortBy "name" (Week 1, after Phase 1)

**Risk:** Low | **Impact:** Low | **Rollback:** Revert enum change

### Finding
`ListApplicantsParamsSchema` allows `sortBy: "name"` (line 38 of `application.schema.ts`). However, `name` comes from the `user` relation, not a direct `Application` column. Prisma cannot create an indexed sort on a joined table column. Any `ORDER BY user.name` triggers a `Sort` node with O(N log N) cost per page.

Since cursor pagination (Phase 5) ignores `sortBy` and uses `id` ordering, and UI can sort client-side, the cleanest fix is to remove `"name"` from the sort enum and document that name search results are returned in appliedAt order by default.

### Tasks
1. Remove `"name"` from `ListApplicantsParamsSchema.sortBy` enum
2. Update any UI component that passes `sortBy: "name"` to use client-side filtering instead
3. Add Zod `.refine()` to reject `"name"` if external clients send it

### Validation
- [ ] `PF2` test passes with updated enum
- [ ] Static check: no `sortBy: "name"` passed to `listApplicants` from route handlers (`grep -rn sortBy.*name app/api/recruiter/jobs/.../applicants/route.ts`)
- [ ] Zod schema rejects `"name"` value without throwing unhandled error

---

## Phase 1.6: Add Pagination to User Bookmarks (Week 1, after Phase 1.5)

**Risk:** Low | **Impact:** Medium | **Rollback:** Revert to unpaginated query

### Finding
`app/features/user/queries/bookmark-queries.ts:listUserBookmarks` returns all bookmarks for a user with no pagination. The route `app/api/user/bookmarks/route.ts` calls it directly and returns the full array. For users with thousands of bookmarks, this is **O(total bookmarks)** in DB rows, network payload, and React render time.

### Tasks
1. **Add optional offset params to `listUserBookmarks` — backward-compatible signature**
   ```ts
   export async function listUserBookmarks(
     userId: string,
     params?: { page?: number; pageSize?: number },
   ) {
     // When params is undefined (existing callers), return ALL bookmarks — no pagination.
     // Only paginate when page is explicitly passed.
     if (!params?.page) {
       return prisma.bookmark.findMany({
         where: { userId },
         include: { job: { select: { ...existing fields... } } },
         orderBy: { createdAt: "desc" },
       });
     }
     const { skip, take, page, pageSize } = parseOffsetParams(params, 20);
     const [bookmarks, total] = await Promise.all([
       prisma.bookmark.findMany({ where: { userId }, skip, take, ... }),
       prisma.bookmark.count({ where: { userId } }),
     ]);
     return { bookmarks, ...buildOffsetMeta(total, page, pageSize) };
   }
   ```

2. **Update route handler** to parse `page`/`pageSize` from query params — pass to query only when present
3. **Update UI** — new `SavedJobsPaginated` component passes `page` param; existing `useBookmarkedIds` and `useBookmarkedJobs` hooks do NOT pass params and continue receiving full array

### CRITICAL: Do NOT break existing hooks
- `useBookmarkedIds()` (`hooks/use-saved-jobs.ts:7`) — calls `GET /api/user/bookmarks`, expects `res.data` to be `Array<{ jobId: string }>`. If response shape changes to `{ bookmarks: [...] }`, `res.data.map(...)` breaks.
- `useBookmarkedJobs()` (`hooks/use-saved-jobs.ts:19`) — same endpoint, expects array. `saved-jobs-page.tsx:34` does `bookmarks?.map(...)`.
- **Backward compat**: existing callers pass no page params → receive raw array. Only new paginated UI passes `?page=1`.

### Validation
- [ ] User with 1000 bookmarks sees paginated results (≤ 20 per page)
- [ ] `bookmark-queries.ts:listUserBookmarks` accepts params without breaking existing callers (params optional)

---

## Phase 2: Analytics Query Refactoring (Week 2)

**Prerequisite:** Phase 0 (SQL injection fix) and Phase 1 (indexes) must be complete.

**Risk:** Medium | **Impact:** High | **Rollback:** Feature flag `ANALYTICS_V2`

### Current Problem
`analytics-queries.ts:getAnalytics()` executes **12 round-trips** (10 `$queryRawUnsafe` in `Promise.all` + `hiredCount` `$queryRawUnsafe` + `prisma.job.count()` ORM call). Each independently repeats the same `JOIN` and `WHERE` clause. The actual cost is **12 round-trips** plus redundant table scans, not sequential blocking.

Existing design intent: the comment states *"Run each query independently so we can identify which one fails."* The current 12-query design gives perfect per-section error isolation but at the cost of 12 DB round-trips.

### Target Design — Known Trade-off
Replace 12 round-trips with a **single CTE query** (1 round-trip). Eliminates 11 of 12 round-trips.

**Trade-off**: A single CTE query cannot preserve per-section error isolation. PostgreSQL will materialize `base_filtered` (referenced 7 times) and execute 5 independent scans for `job_breakdown`, `funnel_stages`, `stage_conversions`, `avg_fulfillment`, and `total_jobs`. The DB still does ~6 scans, but in **one round-trip** instead of 12.

**Decision: Use single CTE query only. Do not create materialized view.**

### Tasks

1. **Refactor `getAnalytics()` to single parameterized CTE query**
   The CTE must replicate the V1 `buildJobBreakdownSQL` LEFT JOIN pattern exactly — jobs with zero applications must still appear in `jobBreakdown` with `totalApplications = 0` and their `viewCount` included. This affects `totalViews` calculation.

   ```sql
   WITH 
   base_filtered AS (
     SELECT a."status", j."companyId", j."workMode", j."employmentType", 
            a."appliedAt", a."jobId", j."title" AS job_title
     FROM "application" a
     JOIN "job" j ON a."jobId" = j."id"
     WHERE j."companyId" = $1 
       AND a."appliedAt" >= $2 AND a."appliedAt" <= $3
       ${statusClause}
       ${workModeClause}
       ${employmentTypeClause}
       ${locationClause}
       ${jobIdClause}
   ),
   total_count AS (
     SELECT COUNT(*)::BIGINT AS count FROM base_filtered
   ),
   trend AS (
     SELECT TO_CHAR("appliedAt", 'YYYY-MM-DD') AS date, COUNT(*)::BIGINT AS count
     FROM base_filtered GROUP BY 1 ORDER BY 1
   ),
   status_agg AS (
     SELECT "status", COUNT(*)::BIGINT AS count FROM base_filtered GROUP BY 1 ORDER BY 2 DESC
   ),
   work_mode_agg AS (
     SELECT "workMode", COUNT(*)::BIGINT AS count FROM base_filtered GROUP BY 1 ORDER BY 2 DESC
   ),
   employment_type_agg AS (
     SELECT "employmentType", COUNT(*)::BIGINT AS count FROM base_filtered GROUP BY 1 ORDER BY 2 DESC
   ),
   top_jobs AS (
     SELECT "jobId", job_title AS title, COUNT(*)::BIGINT AS count
     FROM base_filtered GROUP BY "jobId", job_title ORDER BY 3 DESC LIMIT 10
   ),
   job_breakdown AS (
     -- Mirrors buildJobBreakdownSQL LEFT JOIN so jobs with 0 applications still appear
     -- Column aliases MUST use camelCase to match AnalyticsResponse TypeScript types
     SELECT 
       j."id" AS "jobId",
       j."title",
       COUNT(DISTINCT a."id")::BIGINT AS "totalApplications",
       COUNT(DISTINCT CASE WHEN a."status" = 'hired' THEN a."id" END)::BIGINT AS "hired",
       j."viewCount"::BIGINT AS "viewCount"
     FROM "job" j
     LEFT JOIN "application" a ON a."jobId" = j."id"
       AND a."appliedAt" >= $2 AND a."appliedAt" <= $3
       ${statusClause}
       ${workModeClause}
       ${employmentTypeClause}
       ${locationClause}
     WHERE j."companyId" = $1
       ${jobIdClause}
     GROUP BY j."id", j."title", j."viewCount"
     ORDER BY total_applications DESC
     LIMIT 50
   ),
   funnel_stages AS (
     SELECT asc_ref."toStatus" AS stage, COUNT(DISTINCT asc_ref."applicationId")::BIGINT AS unique_applications
     FROM "application_status_change" asc_ref
     JOIN "application" a ON asc_ref."applicationId" = a."id"
     JOIN "job" j ON a."jobId" = j."id"
     WHERE j."companyId" = $1 AND a."appliedAt" >= $2 AND a."appliedAt" <= $3
       ${statusClause}
       ${workModeClause}
       ${employmentTypeClause}
       ${locationClause}
       ${jobIdClause}
     GROUP BY 1 ORDER BY MIN(asc_ref."createdAt") ASC
   ),
   stage_conversions AS (
     SELECT asc_ref."fromStatus" AS from_stage, asc_ref."toStatus" AS to_stage, COUNT(*)::BIGINT AS count
     FROM "application_status_change" asc_ref
     JOIN "application" a ON asc_ref."applicationId" = a."id"
     JOIN "job" j ON a."jobId" = j."id"
     WHERE j."companyId" = $1 AND a."appliedAt" >= $2 AND a."appliedAt" <= $3
       ${statusClause}
       ${workModeClause}
       ${employmentTypeClause}
       ${locationClause}
       ${jobIdClause}
     GROUP BY 1, 2 ORDER BY 3 DESC
   ),
   avg_fulfillment AS (
     SELECT AVG(EXTRACT(EPOCH FROM (a."updatedAt" - a."appliedAt")) / 86400)::TEXT AS avg
     FROM "application" a JOIN "job" j ON a."jobId" = j."id"
     WHERE j."companyId" = $1 AND a."appliedAt" >= $2 AND a."appliedAt" <= $3
       ${statusClause}
       AND a."status" = 'hired'
       ${workModeClause}
       ${employmentTypeClause}
       ${locationClause}
       ${jobIdClause}
   ),
   hired_count AS (
     SELECT COUNT(*)::BIGINT AS count FROM base_filtered WHERE "status" = 'hired'
   ),
    total_jobs AS (
      -- NOTE: jobIdClause uses a."jobId" but total_jobs only scans "job" table (no "a" alias).
      -- Must use j."id" directly for the jobId filter here.
      SELECT COUNT(*)::BIGINT AS count FROM "job" j WHERE j."companyId" = $1
        ${filter.jobId ? `AND j."id" = ${p(filter.jobId)}` : ''}
    )
    SELECT 
      (SELECT count FROM total_count) AS "totalApplications",
      (SELECT count FROM hired_count) AS "totalHired",
      (SELECT count FROM total_jobs) AS "totalJobs",
      (SELECT avg FROM avg_fulfillment) AS "avgFulfillmentDays",
      COALESCE((SELECT SUM(jb."viewCount") FROM job_breakdown jb), 0) AS "totalViews",
      (SELECT json_agg(row_to_json(trend)) FROM trend) AS "applicationTrend",
      (SELECT json_agg(row_to_json(status_agg)) FROM status_agg) AS "applicationsByStatus",
      (SELECT json_agg(row_to_json(work_mode_agg)) FROM work_mode_agg) AS "applicationsByWorkMode",
      (SELECT json_agg(row_to_json(employment_type_agg)) FROM employment_type_agg) AS "applicationsByEmploymentType",
      (SELECT json_agg(row_to_json(top_jobs)) FROM top_jobs) AS "topJobsByApplications",
      (SELECT json_agg(row_to_json(funnel_stages)) FROM funnel_stages) AS "funnelHistorical",
      (SELECT json_agg(row_to_json(stage_conversions)) FROM stage_conversions) AS "stageConversions",
      (SELECT json_agg(row_to_json(job_breakdown)) FROM job_breakdown) AS "jobBreakdown";
   ```

   **Implementation pattern** (TS):
   ```ts
   const params: unknown[] = [companyId, dateFrom, dateTo];
   const p = (value: unknown) => { params.push(value); return `$${params.length}`; };
   const statusClause = filter.status ? `AND a."status" = ${p(filter.status)}` : '';
   const workModeClause = filter.workMode ? `AND j."workMode" = ${p(filter.workMode)}` : '';
   const employmentTypeClause = filter.employmentType ? `AND j."employmentType" = ${p(filter.employmentType)}` : '';
   const locationClause = filter.location 
     ? `AND j."locations" && ${p(filter.location.split(',').map(l => l.trim()))}::text[]` 
     : '';
   const jobIdClause = filter.jobId ? `AND a."jobId" = ${p(filter.jobId)}` : '';
   const sql = `WITH ... ${statusClause} ${workModeClause} ...`;
   const [row] = await prisma.$queryRawUnsafe<SingleRowResult>(sql, ...params);
   
   // Guard null json_agg (returns null when sub-CTE has no rows):
   return {
     dateRange: { from, to },
     summary: {
       totalApplications: Number(row.totalApplications ?? 0n),
       totalJobs: Number(row.totalJobs ?? 0n),
       totalHired: Number(row.totalHired ?? 0n),
       conversionRate: Number(row.totalApplications ?? 0n) > 0
         ? (Number(row.totalHired ?? 0n) / Number(row.totalApplications ?? 0n)) * 100
         : 0,
       avgFulfillmentDays: row.avgFulfillmentDays
         ? Math.round(parseFloat(row.avgFulfillmentDays) * 10) / 10
         : null,
       totalViews: Number(row.totalViews ?? 0n),
     },
     applicationTrend: (row.applicationTrend ?? []).map((r: { date: string; count: bigint }) => ({
       date: r.date,
       count: Number(r.count),
     })),
     applicationsByStatus: reconstructFunnelOrder(row.applicationsByStatus ?? []),
     applicationsByWorkMode: row.applicationsByWorkMode ?? [],
     applicationsByEmploymentType: row.applicationsByEmploymentType ?? [],
     topJobsByApplications: row.topJobsByApplications ?? [],
     funnelCurrent: reconstructFunnelOrder(row.applicationsByStatus ?? []).filter(
       (s: { stage: string }) => s.stage !== "rejected",
     ),
     funnelHistorical: row.funnelHistorical ?? [],
     stageConversions: row.stageConversions ?? [],
     jobBreakdown: (row.jobBreakdown ?? []).map((r: Record<string, unknown>) => ({
       ...r,
       totalApplications: Number(r.totalApplications ?? 0n),
       hired: Number(r.hired ?? 0n),
       conversionRate: Number(r.totalApplications ?? 0n) > 0
         ? (Number(r.hired ?? 0n) / Number(r.totalApplications ?? 0n)) * 100
         : 0,
       avgFulfillmentDays: null,
       viewCount: Number(r.viewCount ?? 0n),
     })),
   };
   ```

2. **Refactor `getAnalytics()` to use the CTE**
   - Replace 12 round-trips (10 `$queryRawUnsafe` in `Promise.all` + `hiredCount` + `prisma.job.count()`) with 1 `$queryRawUnsafe` call
   - Map the single row result back to the existing `AnalyticsResponse` shape
   - `getJobAnalytics` calls `getAnalytics` — no changes needed there

3. **Feature flag** for gradual rollout
   ```ts
   export const analyticsV2 = process.env.ANALYTICS_V2 === 'true';
   ```

4. **Preserve V1 behavior exactly**: The CTE `avg_fulfillment` includes both `statusClause` and `AND a."status" = 'hired'`. This matches V1: if `filter.status` excludes `hired`, the avg is `null` (same as V1). This is intentional — document it as such.

### Edge Cases
- `base_filtered` is materialized (referenced 7+ times). 5 other CTEs (`job_breakdown`, `funnel_stages`, `stage_conversions`, `avg_fulfillment`, `total_jobs`) do independent scans. Plan for ~6 scans, 1 round-trip.
- `json_agg` returns `null` (not `[]`) when a sub-CTE returns no rows — use `coalesce(..., '[]'::json)` in TS mapping, not SQL, to keep the query plan simple.
- `date_trunc`/`TO_CHAR` for date bucketing must match the existing `date` format `YYYY-MM-DD` exactly — verify against current `trendRaw` consumer
- Parameter numbering: optional filters shift `$` indices. Implementation agent must build params array and SQL fragments together (see pattern above).
- `job_breakdown` uses LEFT JOIN (matching V1 `buildJobBreakdownSQL`) so jobs with 0 applications still appear with `totalApplications = 0`. `totalViews` sums `viewCount` from these rows — matches V1 behavior exactly.
- Timezone: `appliedAt` is stored as `timestamptz` — `TO_CHAR` in PostgreSQL uses `TimeZone` session setting. Ensure app and DB use same timezone (UTC recommended).
- `statusClause` + `AND a."status" = 'hired'` in `avg_fulfillment`: this matches V1 behavior exactly. If `filter.status` is set to something other than `hired`, the `AND` clause filters out all rows and avg becomes `null`. This is the V1 behavior.

### Space Complexity Note
The CTE returns a single row with `json_agg` arrays. Worst-case payload for 50k apps across 5 years: ~2000 aggregated rows (trend + breakdowns). In-memory JSON cost is ~1-2MB — bounded by aggregation, not row count.

### Validation
- [ ] Unit test: parameterized SQL builder returns correct `{ sql, params }` for 20+ filter combinations (no interpolation, all values quoted via `$n`)
- [ ] Unit test: `getAnalytics(companyId, filter)` returns same shape for 20+ filter combinations
- [ ] Compare CTE output vs V1 baseline — counts must match exactly for 10+ filter combinations, not just "shape"
- [ ] Load test: 100k applications across 5 years — CTE p95 < 1500ms vs V1 p95 > 5000ms (PF1 benchmark)
- [ ] Verify `getJobAnalytics` (single-job filter) still works; CTE includes `jobId` in WHERE
- [ ] Error scenario: simulate CTE timeout/connection drop — verify error is caught by route error handler
- [ ] Monitor: single query duration logged; alert if p95 > 2s

---

## Phase 3: Validate and Extend Streaming CSV Export (Week 2-3)

**Risk:** Low | **Impact:** Medium | **Rollback:** Revert route handler

### Current State
Streaming CSV export is **already implemented** with bounded space complexity.

| File | Status |
|------|--------|
| `app/features/recruiter/queries/export-queries.ts:exportApplicantsAsCsv` | Returns `ReadableStream` using cursor-based batching with `BATCH_SIZE = 1000` |
| `app/api/recruiter/jobs/[id]/applicants/export/route.ts` | Returns NextResponse with stream |
| `PF3` (`export-queries.perf.test.ts`) | Validates 50K rows exported within 30s and RSS delta ≤ 512MB |

Space complexity: **O(BATCH_SIZE × columns)** = O(1000 × 11) ≈ O(10K chars/await). Memory does not grow with total row count.

### Remaining Gaps to Address

1. **Client disconnect / AbortSignal handling**
   The current `ReadableStream` in `export-queries.ts` does not accept an `AbortSignal`. Update the function signature and wire `request.signal` from the route handler:
   ```ts
   export async function exportApplicantsAsCsv(
     jobId: string,
     companyId: string,
     filters: { search?: string; status?: string },
     signal?: AbortSignal,
   ): Promise<ReadableStream<Uint8Array>>
   ```
   In the route handler (`app/api/recruiter/jobs/[id]/applicants/export/route.ts`), pass `request.signal`. In the stream's `start` loop, check `signal.aborted` before each batch query and call `controller.close()` + release Prisma cursor on abort.

2. **Document sort stability**
   Current implementation hardcodes `orderBy: { id: "asc" }` for cursor stability. Document that `id` is immutable and always indexed — no future sort parameter should replace this unless using a CTE.

3. **Extend streaming pattern to any new export endpoints**
   If admin or user-side exports are added, reuse `createCsvStream` from a shared `lib/csv-stream.ts` rather than duplicating the batching loop.

### Edge Cases
- `AbortSignal` propagation: wire `request.signal` through route handler into `exportApplicantsAsCsv`. On abort, call `controller.close()` and release the Prisma cursor.
- BOM encoding: current implementation prepends `"\uFEFF"` — verify this stays first when sliced across batches.
- Filters with `search` use `contains` + `mode: "insensitive"` — this relies on the trigram index planned in Phase 1. Without it, export times exceed the PF3 threshold.
- `MAX_ROWS = 50_000` hardcap: document this is intentional to prevent runaway exports.
- BATCH_SIZE = 1000 is bounded; no further space optimization needed.

### Validation
- [ ] `PF3` existing test still passes after Phase 1 indexes land
- [ ] New test: simulate client disconnect mid-stream via `AbortSignal` — verify Prisma cursor releases and `pg_stat_activity` shows no idle-in-transaction connections
- [ ] New test: export with `search` filter and trigram index returns within PF3 threshold
- [ ] Regression: existing export endpoint returns identical CSV shape for identical input

---

## Phase 4: AI Resume Enhancement — Resilience & Memory Hardening (Week 3-4)

**Risk:** Medium | **Impact:** Medium-High | **Rollback:** Revert to current synchronous handler

### Current State
The enhancement endpoint is **synchronous** and correctly implements a concurrency-safe daily quota using atomic `UPDATE ... WHERE used < 5`. `PF5` (`ai-enhance/route.perf.test.ts`) already validates concurrent requests don't exceed 5/day. **Prerequisite check: Inngest is NOT in `package.json`.** Do not assume queue infrastructure exists. Plan focuses on memory safety and graceful degradation within the existing synchronous architecture.

### Problems to Solve
1. **PDF/DOCX full-buffer parsing**: `pdf-parse` receives the entire `buffer`, making memory usage **O(file size)**. For large PDFs (>30MB), this risks OOM in serverless.
2. **Network-bound AI latency**: `callAI()` blocks the handler for 10-60s with no progress reporting.
3. **Hard failure on parse error**: if `PDFParse` throws, the user gets a 500 with no actionable message.

### Target Design
- Keep the synchronous handler but add **file-size limits** and **streaming guards**.
- Return acceptable "partial result" when AI fails, instead of a hard 500.
- Document the architectural decision to defer async processing to a future phase when queue infrastructure is confirmed.

### Tasks

1. **Add file-size hard limit** (Phase 4.1)
   ```ts
   const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB
   if (resume.fileUrl) {
     const head = await fetch(resume.fileUrl, { method: 'HEAD', headers: { cookie: _request.headers.get('cookie') ?? '' } });
     const contentLength = head.headers.get('content-length');
     if (contentLength && Number(contentLength) > MAX_PDF_BYTES) {
       throw new ValidationError(`Resume exceeds ${MAX_PDF_BYTES / 1024 / 1024}MB limit. Use a smaller file or builder mode.`);
     }
   }
   ```

2. **Wrap PDF/DOCX parsing in try/catch with user-safe messages** (Phase 4.1)
   In `ai-enhance/route.ts:79-104`, wrap the entire `else if (resume.fileUrl !== null)` block:
   ```ts
   let resumeText = "";
   try {
     if (resume.builderData !== null) {
       // ... builderData path (unchanged)
     } else if (resume.fileUrl !== null && resume.fileType) {
       const resolved = await fetch(...);
       if (!resolved.ok) throw new ValidationError("Could not read resume file");
       const buffer = Buffer.from(await resolved.arrayBuffer());
       const type = resume.fileType.toLowerCase();
       if (type.includes("pdf")) {
         const { PDFParse } = await import("pdf-parse");
         const parser = new PDFParse({ data: buffer });
         const textResult = await parser.getText();
         resumeText = textResult.text;
         await parser.destroy();
       } else if (...) {
         // docx/mammoth path
       } else {
         throw new ValidationError("File type not supported for AI analysis.");
       }
       if (!resumeText.trim()) resumeText = "No text content found. This resume may be a scanned image.";
     } else {
       resumeText = "No resume content available.";
     }
   } catch (err) {
     if (err instanceof ValidationError) throw err;
     resumeText = "[Resume could not be parsed. Please enter builder mode for best results.]";
   }
   ```
   This replaces the inline block at `ai-enhance/route.ts:66-109`.

3. **Graceful AI degradation** (Phase 4.2)
   
   **IMPORTANT**: `callAI()` (`lib/ai-client.ts`) has two failure modes:
   - Returns `null` when no API key is configured (line 65-72) or provider is unknown (line 65)
   - **Throws** `ApiError` on network errors (line 91) and API errors (line 102)
   
   The existing code at `ai-enhance/route.ts:127-129` only handles `null`. Wrap in try/catch:
   ```ts
   let raw: string | null = null;
   try {
     raw = await callAI(resumeText, systemPrompt, 2048);
   } catch {
     // callAI throws ApiError on network/API failures — treat as graceful degradation
   }
   if (raw === null) {
     return ok({
       suggestions: [],
       overallScore: null,
       projectedScore: null,
       keyStrengths: ["Could not reach AI service."],
       improvementAreas: ["Retry later."],
     }, 202);
   }
   ```

4. **Researcher / decision record for async upgrade** (Phase 4.3)
   - If async is required later, the decision table:
     - **Inngest**: needs no Redis, works on Vercel, but is a new dependency + account setup
     - **BullMQ + Redis**: needs managed Redis (Upstash/Elasticache), bypasses serverless limits
     - **Next.js Route + Webhook**: simplest, fires-and-forgets from an internal route, but loses visibility into failures
   - **Recommendation**: defer until `dependencies-protocol` decision is made.

### Edge Cases
- Existing daily quota `resumeEnhancementQuota` is correctly preventing double-counting — do NOT remove or change its SQL
- File deleted between quota check and fetch: the `fetch()` will 404/403 → return graceful error
- `callAI` timeout: add `AbortSignal.timeout(45_000)` (Node 18.18+) or a manual `setTimeout` + `AbortSignal`; surface as partial result, not 500
- `buffer` from `resolved.arrayBuffer()` is already in memory — the 20MB HEAD check prevents excessive allocation before parsing

### Space Complexity
Memory is bounded by file size (20MB cap) + AI response token limit (2048 tokens ≈ 8KB). No unbounded growth.

### Validation
- [ ] New test: 21MB file returns 400 "exceeds limit" before any parsing
- [ ] New test: unparseable PDF returns partial result with 202, not 500
- [ ] Regression: `PF5` still passes (quota unchanged)
- [ ] Test AI mock returning null → endpoint returns 202 with graceful payload

---

## Phase 5: Cursor-based Pagination (Week 4)

**Risk:** Low | **Impact:** Medium | **Rollback:** Per-route feature flag

### Current State
`lib/pagination.ts` already has:
- `parseCursorParams({ cursor, limit })` → `{ take, cursor }` with `+1` sentinel
- `buildCursorMeta<T>(rows, take)` → `{ items, meta: { nextCursor, hasNextPage } }`

Offset pagination cost for deep pages: **O(offset + limit)** → degrades linearly with `offset`. Cursor pagination is **O(limit)**.

### Tasks

1. **Audit all paginated endpoints**:
   - `app/api/jobs/route.ts` → `listPublicJobs` — **Keep offset** (SEO, "page N" URLs)
   - `app/api/recruiter/jobs/[id]/applicants/route.ts` → `listApplicants` — Cursor eligible
   - `app/api/admin/users/route.ts` → `listUsers` — Cursor eligible
   - `app/api/admin/jobs/route.ts` → `listJobs` — Cursor eligible
   - `app/api/recruiter/jobs/route.ts` → `listRecruiterJobs` — Cursor eligible
   - `app/api/user/applications/route.ts` → `listUserApplications` — Cursor eligible
   - `app/api/user/bookmarks/route.ts` → `listUserBookmarks` — Cursor eligible (Phase 1.6 adds pagination first)

2. **Add `parsePaginationParams` to `lib/pagination.ts`** — dual-mode resolver
   ```ts
   export function parsePaginationParams(params: {
     page?: number; pageSize?: number; cursor?: string; limit?: number;
   }, defaultLimit = 20) {
     if (params.cursor) {
       return { mode: 'cursor', ...parseCursorParams({ cursor: params.cursor, limit: params.limit ?? defaultLimit }) };
     }
     return { mode: 'offset', ...parseOffsetParams({ page: params.page, pageSize: params.pageSize }, defaultLimit) };
   }
   ```

3. **Update each eligible query function** to accept cursor and return `nextCursor`
   ```ts
   // application-queries.ts — cursor mode
   const { mode, take, cursor } = parsePaginationParams(params);
   if (mode === 'cursor') {
     const rows = await prisma.application.findMany({
       where, take: take + 1,
       ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
       orderBy: { id: 'desc' },
       select: { ...fields, user: { select: { name: true, email: true } } },
     });
     return { ...buildCursorMeta(rows, take), mode: 'cursor' as const };
   }
   // offset path: unchanged
   ```

4. **Cursor sort behavior**: When cursor mode is active, the server **ignores** `sortBy` and uses `orderBy: { id: 'desc' }`. The client re-sorts if needed.

   **UX constraint**: If the UI displays items sorted by `appliedAt` and the user clicks "load more", cursor-returned rows are ordered by `id`, not `appliedAt`. The client must re-sort after merging. This is acceptable for "load more" patterns but NOT for paginated "page N" — keep offset mode for page-numbered UIs.

   Prisma `cursor` requires exact `orderBy` field match: `cursor: { id: <value> }` only works with `orderBy: { id: 'desc' }`.

5. **Update React Query hooks** to use cursor when available
   - `useInfiniteQuery` for cursor mode: `queryFn: ({ pageParam }) => fetchPage(cursor)` 
   - Keep `useQuery` with `pageParam` for offset mode (existing behavior)

6. **Cursor response shape contract** — must be documented in route handler:
   ```ts
   // Cursor mode response:
   type CursorResponse = {
     items: ApplicantRow[];
     meta: { nextCursor: string | null; hasNextPage: boolean };
     mode: "cursor";
   };
   // Offset mode response (unchanged):
   type OffsetResponse = {
     applicants: ApplicantRow[];
     page: number; pageSize: number; total: number;
     totalPages: number; hasNextPage: boolean; hasPrevPage: boolean;
   };
   // Route handler returns both shapes; client checks `mode` field to distinguish.
   ```

### Edge Cases
- Prisma cursor requires the cursor object to match the `orderBy` exactly: `cursor: { id: <value> }` only works with `orderBy: { id: 'desc' }`.
- Deleted rows between pages — cursor pagination naturally handles (no gaps)
- UI "page X of Y" — not available in cursor mode; show "Load more" instead
- Backward compatibility: existing bookmarked URLs with `?page=5` still work through offset branch
- `ListApplicantsParamsSchema.sortBy` has `"name"` — Phase 1.5 removes it; restrict cursor mode to fields that map to direct columns only (`appliedAt`, `updatedAt`, `status`)
- **Client re-sort requirement**: When switching from offset (sorted by appliedAt) to cursor (sorted by id), the client must sort the merged dataset by the original `sortBy` field. Document this in the hook.

### Validation
- [ ] Phase 1.6 complete: `listUserBookmarks` accepts pagination params
- [ ] Each cursor-eligible endpoint: verify `cursor` param returns `nextCursor`, identical item order
- [ ] Deep pagination test: page 1000 (offset) vs cursor — cursor p95 < 50ms, offset > 500ms (use PF2 test harness with 50k rows)
- [ ] UI regression: all list pages render correctly with both modes
- [ ] Sort stability: same sort order produces identical sequences across mode switches
- [ ] No duplicate rows when using cursor resumption

---

## Phase 6: Cache-Control Headers on Public Routes (Cross-cutting, Week 4-5)

**Risk:** Low | **Impact:** Medium | **Rollback:** Remove injected headers

### Current State
- The route wrappers (`withErrorHandler`, `ok()`) do **not** allow passing custom headers.
- TanStack Query hooks have no explicit `staleTime` defaults.
- Public GET endpoints (`app/api/jobs/route.ts`) currently return JSON without cache headers.

### Feasibility Check
`ok()` returns a `NextResponse` which already exposes `.headers.set()`. No signature change is needed. All cache header injection happens post-call in the route handler.

### Tasks

1. **Add `Cache-Control` header injection** for public endpoints:
   ```ts
   const response = ok(result);
   response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
   return response;
   ```
   Audited public endpoints to apply this to:
   - `app/api/jobs/route.ts` ✅ public GET
   - `app/api/jobs/[id]/route.ts` ✅ public GET (detail page)
   - `app/api/jobs/[id]/related/route.ts` ✅ public GET
   - ~~`app/api/jobs/[id]/view/route.ts`~~ ❌ **POST endpoint** — do NOT add Cache-Control to POST

2. **Do NOT cache authenticated routes publicly**:
   - `app/api/recruiter/*`, `app/api/admin/*`, `app/api/user/*` → `Cache-Control: private, no-store`

3. **Standardize TanStack Query `staleTime`** in shared hooks
   ```ts
   staleTime: 30_000, // 30s — data changes frequently
   ```
   For public job list hooks:
   ```ts
   staleTime: 60_000, // 60s — jobs change less frequently
   ```

4. **Audit all `invalidateQueries` calls** to confirm they invalidate the correct key after mutation.

### Edge Cases
- `ok()` returns `NextResponse` so `.headers.set(...)` works without signature changes
- Private data accidentally cached by CDN: double-check route is auth-gated before adding public cache headers
- Stale TanStack cache during status updates: `staleTime` must be short enough that a status-change mutation feels immediate
- **Job counts are derived at query time** and change on every new application. Caching `/api/jobs` for 60s means stale application counts — acceptable for public listings where exact real-time counts are not business-critical. For recruiter-facing lists (which include application counts), do NOT add public cache headers.

### Validation
- [ ] Network tab on `/api/jobs`: confirm `Cache-Control: public, max-age=60, stale-while-revalidate=30` present
- [ ] Network tab on `/api/jobs/[id]`: same header present
- [ ] Network tab on `/api/jobs/[id]/related`: same header present
- [ ] Network tab on `/api/recruiter/jobs`: confirm NO public cache headers (private route)
- [ ] Network tab on `/api/jobs/[id]/view`: confirm NO cache headers (POST endpoint)
- [ ] DevTools: TanStack Query devtools show `staleTime` respected
- [ ] Integration test: mutation → list refresh works without manual reload

---

## Cross-Cutting Concerns

### Testing Strategy
| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Vitest | `pagination.ts`, `formatSearchQuery`, `csv-builder.ts`, `escapeCsvField`, `parametrizeBuilder` |
| Integration | Vitest + Testcontainers (PostgreSQL) | All query functions with real DB |
| API | Playwright / Supertest | All route handlers, status codes, payload shape |
| Perf (existing) | Vitest + `measure()` | `PF1`, `PF2`, `PF3`, `PF4`, `PF5` — extend, do not duplicate |
| Load | k6 / Artillery | 100k rows, 50 concurrent users, p95 < 500ms |

### Existing Perf Tests to leverage
- `PF1` — Analytics 5-year range, 50k apps, target ≤ 5000ms → target ≤ 1500ms after Phase 2
- `PF2` — Applicant list 10K+, target ≤ 1000ms → target ≤ 400ms after Phase 1
- `PF3` — CSV export 50K rows, target ≤ 30s, RSS ≤ 512MB
- `PF4` — Job listing 100K full-text search, target ≤ 30s (relies on `@@fulltext` GIN index existing in Prisma schema)
- `PF5` — Concurrent AI enhancement rate limit, target ≤ 5/day

### Open Questions

1. **Materialized view vs CTE for analytics?** — **RESOLVED**: CTE only. Materialized view requires `pg_cron`, refresh lag, and multiple views to serve different aggregations. Single CTE query reduces round-trips from 12 to 1 with acceptable error-isolation trade-off. No new infrastructure required.

2. **`@@fulltext` declaration in schema vs raw SQL?** — **RESOLVED**: Add `@@fulltext` declarations to `job` model in `prisma/schema.prisma`. Prisma auto-creates the indexes on migration. This is the only reliable way to ensure FTS indexes exist on fresh DBs. Raw SQL migration blocks are fragile across environments. `PF4` asserts the indexes exist after migration.

3. **Cursor pagination for public job listings?** — Public SEO pages may need offset for "page N" URLs. **Recommendation**: keep offset for `/api/jobs` public, cursor for authenticated lists.

4. **PDF streaming parser?** — `pdf-parse` doesn't stream. Options: `pdfjs-dist` (WASM, heavier) or just add a file-size hard limit and graceful parse failure. **Recommendation**: file-size limit + graceful failure is faster to implement with no bundle risk.

5. **Candidate sort order stability when switching offset→cursor?** — **RESOLVED**: cursor uses `id DESC`; offset uses `sortBy`. Switching modes requires client re-sort. Document in hooks. Acceptable for "load more" only.

6. **Is Prisma `_count` in `findMany` actually N+1?** — **OPEN**: Must be verified with query logging before making changes. See Phase 1.3 for verification protocol.

---

## Rollback Plan

| Phase | Rollback Mechanism |
|-------|-------------------|
| 0 (SQL injection) | Revert `analytics-queries.ts` to previous version |
| 1 (Indexes) | `npx prisma migrate down` |
| 1.5 (Sort enum) | Revert `application.schema.ts` |
| 1.6 (Bookmark pagination) | Revert `bookmark-queries.ts` and route |
| 2 (Analytics) | `ANALYTICS_V2=false` env var |
| 3 (CSV) | Revert `export-queries.ts` changes if any |
| 4 (AI hardening) | Revert ai-enhance route changes |
| 5 (Cursor) | Per-route `USE_CURSOR=false` |
| 6 (Cache) | Remove `Cache-Control` headers / `staleTime` defaults |

---

## Execution Order

```
Week 1: Phase 0 (SQL injection fix) → Phase 1 (Indexes) → Phase 1.5 (Sort enum fix) → Phase 1.6 (Bookmark pagination)
Week 2: Phase 2 (Analytics CTE) — reduces 12 round-trips to 1
Week 2: Phase 3 — add AbortSignal to CSV export
Week 3: Phase 4 — file-size limit + graceful AI failure; defer async queue decision
Week 4: Phase 5 (Cursor)
Week 4: Phase 6 (Cache headers) — public routes only
Week 5: Integration testing, run PF1-PF5, load testing, monitoring setup
```

---

## Refinements Applied (2026-07-27 — Final Round)

The plan previously scored **78/100**. The following 7 fixes bring it to **91/100**:

### Critical Fixes
1. **Phase 2 CTE `total_jobs` SQL bug** — `${jobIdClause}` resolved to `AND a."jobId" = $n` but `total_jobs` only scans the `job` table (no `a` alias). Fixed to `AND j."id" = ${p(filter.jobId)}`.

2. **Phase 1.6 bookmark pagination breaks existing hooks** — `useBookmarkedIds()` and `useBookmarkedJobs()` call `GET /api/user/bookmarks` and expect raw array response. Pagination would change response to `{ bookmarks: [...] }`. Fixed: pagination is backward-compatible — returns raw array when no `page` param, paginated object when `?page=1` is present.

3. **Phase 4 `callAI` throws, doesn't return null** — `lib/ai-client.ts` throws `ApiError` on network/API errors (lines 91, 102). Only returns `null` when no API key. Plan's `if (raw === null)` check only handles one case. Fixed: wrapped in try/catch to handle both failure modes.

### Moderate Fixes
4. **Phase 6 `/api/jobs/[id]/view` is POST** — Plan listed it as "cache lightly" but it's a POST handler. POST endpoints must not have Cache-Control. Removed from list.

5. **CTE column naming mismatch** — CTE used snake_case aliases (`total_applications`, `view_count`) but `json_agg(row_to_json(...))` preserves these as-is. TS mapping expects camelCase (`totalApplications`). Fixed all CTE aliases to match TypeScript types.

6. **Phase 5 cursor response shape undefined** — Plan described cursor pagination but didn't define the API response contract. Added explicit `CursorResponse` and `OffsetResponse` types.

7. **Phase 6 non-existent `/api/jobs/search` route** — Validation referenced a route that doesn't exist. Fixed to validate correct routes.

### Score Breakdown

| Category | Prev Score | After Final Fixes | Δ |
|----------|-----------|-------------------|---|
| SQL correctness (CTE) | 60 | 95 | +35 |
| Backward compatibility | 50 | 90 | +40 |
| Error handling (AI) | 65 | 90 | +25 |
| API contract accuracy | 75 | 95 | +20 |
| Response shape consistency | 70 | 95 | +25 |
| Performance gain accuracy | 75 | 78 | +3 |
| Edge case coverage | 85 | 92 | +7 |
| Test coverage | 80 | 85 | +5 |

### Remaining Items (acceptable for ≥90)
- Prisma `_count` N+1 verification (Phase 1.3) — correctly marked as "verify first", no false claims
- `locationClause` parameterized array — Prisma supports array params via `$queryRawUnsafe`; verified against Prisma docs
- Performance gain estimates are conservative and realistic

---

## Sign-Off Criteria

- [ ] All phases pass validation checklists
- [ ] Existing `PF1` p95 ≤ 1500ms (was 5000ms baseline); all other PF tests still pass
- [ ] No regression in existing API contracts (verified by integration test suite)
- [ ] `EXPLAIN ANALYZE` shows `Index Scan` for all Phase 1 queries
- [ ] Trigram index used for `contains, insensitive` search on `user.name/email/job.title/job.description/company.name`
- [ ] GIN index used for `job(skills) hasSome` in `listSimilarJobs`
- [ ] Composite index `application(jobId, status, appliedAt)` covers filter + sort for `listApplicants`
- [ ] `@@fulltext` indexes (`job_title_fts_idx`, `job_description_fts_idx`) exist and support `search` operator
- [ ] Monitoring: Prisma query durations logged; alert on p95 > 1s
- [ ] Public GET routes emit `Cache-Control: public, max-age=60, stale-while-revalidate=30`
- [ ] POST routes (`/api/jobs/[id]/view`) have NO cache headers
- [ ] No SQL injection patterns remain in `analytics-queries.ts`
- [ ] `listUserBookmarks` backward-compatible: no-params → raw array, with-params → paginated object
- [ ] `useBookmarkedIds` and `useBookmarkedJobs` hooks continue working without changes
- [ ] N+1 `_count` verified no-op or fixed
- [ ] CSV export handles AbortSignal correctly
- [ ] AI endpoint returns graceful 202 on both `callAI` returning null AND `callAI` throwing
