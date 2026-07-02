# TEST-MANIFEST.md

> **Last Updated:** 2026-07-02  
> **Current Phase:** 0  
> **Current Block:** None  
> **Source of truth:** `docs/testing/testing-strategy.md`

## Phase 0 — Infrastructure

- [ ] 0.0 `vitest.config.ts`
- [ ] 0.1 Test database (`hireflow_test`)
- [ ] 0.2 `lib/test/global-setup.ts`
- [ ] 0.3 `lib/test/test-db.ts`
- [ ] 0.4 `lib/test/reset-db.ts`
- [ ] 0.5 `lib/test/factories.ts`
- [ ] 0.6 `lib/test/auth-fixtures.ts`
- [ ] 0.7 `lib/test/mocks.ts`
- [ ] 0.8 `package.json` scripts

## Phase 1 — Unit Tests

- [ ] 1.1 `lib/rate-limiter.test.ts`
- [ ] 1.2 `csv-builder.test.ts` (colocated with source)
- [ ] 1.3 `lib/pagination.test.ts`
- [ ] 1.4 `lib/api-error.test.ts` (error classes → HTTP status via api-wrapper)
- [ ] 1.5 `lib/routes.test.ts` (isHiddenRoute matrix)
- [ ] 1.6 `lib/job-categories.test.ts`
- [ ] 1.7 `rate-limit-message.test.ts` (colocated, 20/hr boundary)
- [ ] 1.8 `lib/ai-client.test.ts` (provider selection, null-fallback, all 3 provider error shapes)
- [ ] 1.9 `require-role.test.ts` (direct guard invocation: allowed, unauthorized, forbidden, companyId resolution)
- [ ] 1.10 `lib/validator.test.ts` (success/failure wrapping)
- [ ] 1.11 `presence-store.test.ts` (set/clear/subscribe/persistence)
- [ ] 1.12 `applicant-table-utils.test.ts` (transition intersection logic)
- [ ] 1.13 Zod schemas — `profile.schema.ts`
- [ ] 1.14 Zod schemas — `resume.schema.ts`
- [ ] 1.15 Zod schemas — `resume-ai.schema.ts`
- [ ] 1.16 Zod schemas — `application-submit.schema.ts`
- [ ] 1.17 Zod schemas — `job.schema.ts`
- [ ] 1.18 Zod schemas — `admin.schema.ts`
- [ ] 1.19 Zod schemas — `company.schema.ts`
- [ ] 1.20 Zod schemas — `team.schema.ts`
- [ ] 1.21 Zod schemas — `analytics.schema.ts`

## Phase 2 — Integration Tests

Test DB with `resetDb()` in `beforeEach`. Mocked auth session, Pusher/AI/Resend. Call route handlers directly.

- [ ] #1 Tenant isolation (`require-admin.ts`, recruiter queries)
- [ ] #2 Public job queries (`listPublicJobs` dual-gate)
- [ ] #3 Apply route (`app/api/jobs/[id]/apply/route.ts`)
- [ ] #4 Status + bulk status routes
- [ ] #5 Revert route
- [ ] #6 Resume routes (cap, soft-delete, set-primary)
- [ ] #7 AI enhance route (DB-backed 5/day, null-fallback, no auto-apply)
- [ ] #8 Message routes (recruiter + admin: rate limit, Pusher channel, notification)
- [ ] #9 Bookmarks route (toggle idempotency, @@unique)
- [ ] #10 CSV export route (filter respect, tenant isolation, streaming cap)
- [ ] #11 Ban + sessions routes (flag + revoke + subsequent rejection)
- [ ] #12 Withdraw route (status gate)
- [ ] #13 File download route (auth matrix: owner/recruiter/admin/unrelated)
- [ ] #14 AI client per-provider error handling (invalid key → 502 not 500)
- [ ] #15 AI enhance DB rate-limit persistence (5 logs → restart → 6th → 429)
- [ ] #16 Notifications route (type discriminator, cursor pagination, side-effect free)
- [ ] #17 `require-role` direct guard (super_admin bypass, recruiter w/o company → 403)

## Phase 3 — Component Tests (RTL, `*.dom.test.tsx`)

### Data & Status Components
- [ ] `data-table.test.tsx` (selection, disabledIds, getRowId)
- [ ] `status-timeline.test.tsx` (ordering, single-entry case)
- [ ] `applicants-table.test.tsx` (bulk intersection logic)
- [ ] `bulk-reject-dialog.test.tsx` (reason required, mutation)
- [ ] `account-popover.test.tsx` (role-aware menu, no user Dashboard)

### Form Components
- [ ] `resume-builder-form.test.tsx` (useFieldArray, skills dedup)
- [ ] `apply-modal.test.tsx` (no resume → disabled, cover letter >5000)

### Search & Interaction
- [ ] `job-search-bar.test.tsx` (debounce, URL sync)
- [ ] `save-job-button.test.tsx` (anonymous redirect, authenticated toggle)

### AI Components
- [ ] `ai-suggestions-panel.test.tsx` (per-item apply, copy to clipboard)

### Chat Components
- [ ] `chat-input-area.test.tsx` (Enter/Shift+Enter, disabled, file attach)
- [ ] `message-bubble.test.tsx` (text, file link, alignment, timestamp)
- [ ] `shared-thread-view.test.tsx` (header, scroll-to-bottom, skeleton, error+retry)
- [ ] `thread-list-item.test.tsx` (unread badge, active highlight, truncation)
- [ ] `chat-header.test.tsx` (name/avatar, status, mobile back)

### Empty/Special States
- [ ] `no-company-prompt.test.tsx` (CTA rendering, link navigation)

## Phase 4 — E2E (Playwright)

### Setup
- [ ] `playwright.config.ts` (multi-role projects + storageState)
- [ ] `e2e/global.setup.ts` (login via UI, save storage state)
- [ ] `prisma/seed-e2e.ts` (fixed test accounts)

### Journeys
- [ ] `anonymous-apply-redirect.spec.ts`
- [ ] `user-apply-flow.spec.ts`
- [ ] `recruiter-pipeline.spec.ts`
- [ ] `recruiter-bulk-reject.spec.ts`
- [ ] `admin-ban-user.spec.ts`
- [ ] `messaging-roundtrip.spec.ts` (real Pusher test app)
- [ ] `ai-resume-enhance.spec.ts` (stubbed provider via page.route)
- [ ] `csv-export.spec.ts` (download + parse + spot-check)

## Phase 5 — CI & Coverage

- [ ] 5.1 Raise thresholds to 60% (after Phase 1+2)
- [ ] 5.2 Raise thresholds to 70% (after Phase 3)
- [ ] 5.3 `.github/workflows/test.yml` (postgres service + e2e)

---

## Manual Testing Checklist

- [ ] All role-based redirects (middleware)
- [ ] File upload/download with auth boundaries
- [ ] Real-time messaging (Pusher) across roles
- [ ] Bulk operations atomicity
- [ ] AI rate limit + graceful fallback
- [ ] CSV export filter + tenant boundaries
- [ ] Sitemap + robots.txt correctness
- [ ] JSON-LD structured data validation
