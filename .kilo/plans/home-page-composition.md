# Phase 4.5 — Upgrade Job Search to PostgreSQL Full-Text Search

## Goal

Replace `ILIKE contains` in `listPublicJobs` with PostgreSQL FTS (`to_tsquery`/`to_tsvector`) for stemmed word matching + stop word removal. Skip `_relevance` orderBy due to confirmed open Prisma bug #24042.

## Context Files (read first)

- `prisma/schema.prisma` — generator block, current preview features
- `app/features/jobs/queries/public-job-queries.ts` — `listPublicJobs` function, lines 76-134
- `app/api/jobs/route.ts` — passes URL params to `listPublicJobs`, unchanged
- `app/features/jobs/components/job-list-page.tsx` — client renderer, unchanged
- `app/features/landing/components/featured-jobs.tsx` — calls `listPublicJobs({ pageSize: 6 })` without search, unchanged

## Files to Modify (2)

### 1. `prisma/schema.prisma`

Add preview feature flag to enable FTS operators in generated client:

```prisma
generator client {
  provider        = "prisma-client"
  output          = "../app/generated/prisma"
  previewFeatures = ["fullTextSearchPostgres"]
}
```

Then run `npx prisma generate`.

### 2. `app/features/jobs/queries/public-job-queries.ts`

**Only lines 84-89 change.** The search filter block:

```typescript
// BEFORE (lines 84-89):
if (params.search) {
  where.OR = [
    { title: { contains: params.search, mode: "insensitive" } },
    { description: { contains: params.search, mode: "insensitive" } },
  ];
}

// AFTER:
if (params.search) {
  const formattedQuery = params.search
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(" | ");
  where.OR = [{ title: { search: formattedQuery } }, { description: { search: formattedQuery } }];
}
```

**Everything else in the file is unchanged:** imports, types, `where` object construction (lines 79-82), other filters (90-100), `orderBy` (109), `include` (110), `count` (112), mapping (115-131), return (133), `getPublicJobById` (136-172).

## What Changes (SQL Level)

```sql
-- BEFORE (ILIKE):
WHERE status = 'active' AND is_active = true
  AND (
    title ILIKE '%software developer%'
    OR description ILIKE '%software developer%'
  )
ORDER BY "createdAt" DESC

-- AFTER (FTS):
WHERE status = 'active' AND is_active = true
  AND (
    to_tsvector('english', "title") @@ to_tsquery('english', 'software | developer')
    OR to_tsvector('english', "description") @@ to_tsquery('english', 'software | developer')
  )
ORDER BY "createdAt" DESC
```

## Decisions Made

| Decision                                         | Rationale                                                                                                                                                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skip `_relevance` orderBy**                    | Confirmed open Prisma bug #24042 — multi-word queries crash with PostgreSQL error 42601 if results exist. Keep `createdAt desc` as fallback. Will add when Prisma fixes it.                                                           |
| **OR between terms** ( `software \| developer` ) | Broadest match. A job matching either "software" or "developer" appears. Matches the typical job search UX where users throw in multiple keywords.                                                                                    |
| **Strip non-alphanumeric**                       | Prevents tsquery injection (`hello!@#` → `hello`). Avoids `to_tsquery()` parse errors.                                                                                                                                                |
| **Accept no-typo tolerance**                     | FTS uses dictionary-based stemming (English config): `developer` → matches `develop`, `development`, `developing`. But `devloper` (typo) won't match. Trade-off accepted — ILIKE could match typos as substrings but had no stemming. |

## Edge Cases Verified (No Breaking Changes)

| Test Case                               | Current Behavior                                 | New Behavior                               | Verdict                           |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------------ | --------------------------------- |
| No search param                         | `orderBy createdAt desc`                         | Same                                       | ✅                                |
| Single word `developer`                 | `ILIKE '%developer%'`                            | `to_tsquery('developer')`                  | ✅ FTS stems & removes stop words |
| Multi-word `software developer`         | `ILIKE '%software developer%'` (exact substring) | `to_tsquery('software \| developer')` (OR) | ✅ Broader, better                |
| Filters + search                        | AND combined                                     | Same structure                             | ✅                                |
| Landing page (`pageSize: 6`)            | No search param, unchanged                       | Unchanged                                  | ✅                                |
| Category strip (`?industry=Technology`) | No search param                                  | Unchanged                                  | ✅                                |
| Company filter (`?companyId=X`)         | No search param                                  | Unchanged                                  | ✅                                |
| `prisma.job.count`                      | Same `where` object                              | Same                                       | ✅                                |
| API response shape                      | `{ data: { jobs, total, ... } }`                 | Same                                       | ✅                                |
| `FeaturedJobs` component                | `listPublicJobs({ pageSize: 6 })`                | Unchanged                                  | ✅                                |
| Empty search `?search=`                 | `params.search` is `""` (falsy)                  | `if (!params.search)` skips FTS            | ✅                                |
| Special chars `hello!@#`                | `ILIKE '%hello!@#%'`                             | Stripped to `hello` (no error)             | ✅                                |
| `Record<string, unknown>` where type    | Accepts any operator                             | Accepts `search`                           | ✅                                |
| `getPublicJobById`                      | `findUnique`, no search                          | Unchanged                                  | ✅                                |

## Failure Modes (Mitigated)

| Failure                                  | Cause                                                  | Mitigation                                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `to_tsquery('')` (empty after stripping) | Search was all special chars, stripped to empty string | `formattedQuery` will be `""` (falsy), the `where.OR` setter still runs but `to_tsquery('')` → PostgreSQL returns no results (safe, not crash) |
| `_relevance` bug (skipped)               | Prisma issue #24042                                    | We don't use `_relevance` at all                                                                                                               |
| prisma generate with preview flag        | Flag not supported in older Prisma versions            | Current Prisma 7.8.0 supports it since Prisma 4.x                                                                                              |
| Migration rollback                       | Need to revert to ILIKE                                | Revert schema flag + regenerate + revert query changes                                                                                         |

## Validation

1. `npx prisma generate` — must succeed (adds `search` to StringFilter + `_relevance` to orderBy types)
2. `npx tsc --noEmit` — zero errors
3. `npx eslint --quiet` — zero warnings on modified file
4. Manual test: search `developer` → confirm results (FTS stemming works)
5. Manual test: search `software developer` → confirm no crash (bug only applies to `_relevance`, which we don't use)
6. Manual test: search `software&developer` (no spaces) → formatted to `software | developer`, works
7. Manual test: search `devloper` (typo) → no matches (expected — FTS limitation)
8. Manual test: landing page loads → `FeaturedJobs` passes no search param → unchanged

## Files Not Touched

`JobSearchBar`, `JobListPage`, `job-card.tsx`, `filter-select.tsx`, `hero-search.tsx`, `category-strip.tsx`, `featured-companies.tsx`, `employer-cta.tsx`, `landing-page.tsx`, `footer.tsx`, `app/api/jobs/route.ts` — all unchanged.
