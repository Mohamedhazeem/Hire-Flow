# TEST-MANIFEST.md
 
> **Last Updated:** 2026-07-17  
> **Current Phase:** 8 (complete)  
> **Current Block:** CI green on master push + PRs  
> **Source of truth:** `docs/testing/testing-strategy.md`
>
> **Note on paths:** Test infra and suites live under `lib/test/**` (not `test/**`).
> Playwright specs live under `e2e/specs/**` and the e2e seed is `e2e/seed-e2e.ts`.
>
> **Legend:** `[x]` implemented · `[~]` partially covered / follow-up needed · `[ ]` not yet implemented.
>
> **Status summary:** Phases 0–3 complete. Phase 4 complete, including the
> granular edge-case blocks (U*, N2/N4–N6, S1–S5, A4, M*, C1/C2/C4).
> Phase 5 component tests complete (16/16). Phases 6–7 complete. Phase 8 CI complete;
> coverage thresholds ratcheted to the measured floor (8.1); raising to 60/70 (8.2/8.3)
> deferred until more tests land.
 
## Phase 0 — Infrastructure
 
- [x] 0.0 `vitest.config.ts` (3 projects: default / dom / perf)
- [x] 0.1 Test database (`hireflow_test`)
- [x] 0.2 `lib/test/global-setup.ts`
- [x] 0.3 test DB client — `lib/prisma.ts` (`DATABASE_URL_TEST` → `DATABASE_URL`)
- [x] 0.4 `lib/test/reset-db.ts`
- [x] 0.5 `lib/test/factories/**` (+ `seed-factories.ts`)
- [x] 0.6 `lib/test/auth-fixtures.ts`
- [x] 0.7 `lib/test/mocks.ts`
- [x] 0.8 `package.json` scripts

## Phase 1 — Input Validation & Schema Hardening

### SQL Injection Prevention
- [x] 1.a1 `analytics-queries.security.test.ts` (SQL payloads in all 7 filter params)
- [x] 1.a2 `analytics.schema.test.ts` (enum enforcement on status/workMode/employmentType/jobId UUID)

### Input Edge Cases
- [x] 1.b1 `profile.schema.test.ts` (caps, Unicode, empties, duplicates)
- [x] 1.b2 `resume.schema.test.ts`
- [x] 1.b3 `resume-ai.schema.test.ts`
- [x] 1.b4 `application-submit.schema.test.ts` (char limits, null bytes, UUID format)
- [x] 1.b5 `job.schema.test.ts` (Unicode, salary range validation)
- [x] 1.b6 `auth.schema.test.ts` (email format, password policies)
- [x] 1.b7 `admin.schema.test.ts` (HTML/SQL in banReason, role enum)

### Mass Assignment Prevention
- [x] 1.c1 `PATCH /api/admin/users/[id]/role` (extra fields ignored) — `admin/role.test.ts`
- [x] 1.c2 `POST /api/jobs/[id]/apply` (status override rejected) — `jobs/apply.test.ts`
- [x] 1.c3 `PATCH /api/user/resumes/[id]` (immutable fields protected) — `user/resumes.test.ts`
- [x] 1.c4 `PATCH /api/recruiter/jobs/[id]` (companyId/viewCount protected) — covered via `auth.idor.test.ts` / `job.schema.test.ts`

## Phase 2 — Unit Tests

- [x] 2.1 `lib/rate-limiter.test.ts` (includes key isolation, concurrency) — `unit/rate-limit.test.ts`
- [x] 2.2 `csv-builder.test.ts` (includes Unicode)
- [x] 2.3 `lib/pagination.test.ts` (includes boundary edge cases)
- [x] 2.4 `lib/api-error.test.ts` (includes error message leak test)
- [x] 2.5 `lib/routes.test.ts`
- [x] 2.6 `lib/job-categories.test.ts`
- [x] 2.7 `rate-limit-message.test.ts` (includes pair isolation)
- [x] 2.8 `lib/ai-client.test.ts` (environment selection)
- [x] 2.9 Zod schemas — all schemas (valid, invalid, caps, Unicode, null bytes) — `lib/test/schemas/**`
- [x] 2.10 `require-role.test.ts`
- [x] 2.11 `lib/validator.test.ts`
- [x] 2.12 `presence-store.test.ts`
- [x] 2.13 `applicant-table-utils.test.ts`
- [x] 2.14 `lib/ai-client.test.ts` (expanded: all 3 providers, error shapes)

## Phase 3 — Authentication & Authorization Tests

### Session & Token Security
_All covered by `lib/test/integration/auth/auth.session.test.ts`._
- [x] 3.0a Expired session → 401
- [x] 3.0b Malformed token → 401
- [x] 3.0c Missing auth → 401
- [x] 3.0d User → /admin/* → 403
- [x] 3.0e Admin → /recruiter/* → 403
- [x] 3.0f Banned user with session → 401
- [x] 3.0g Super admin bypass

### IDOR Protection (all resource types)
_All covered by `lib/test/integration/auth/auth.idor.test.ts`._
- [x] 3.I1 Application detail
- [x] 3.I2 Job management
- [x] 3.I3 Resume
- [x] 3.I4 Profile
- [x] 3.I5 Thread
- [x] 3.I6 Message (via thread isolation)
- [x] 3.I7 Notification
- [x] 3.I8 Bookmark
- [x] 3.I9 Admin user actions

### Middleware & Redirect
_Covered by E2E `cross-role-access.spec.ts` + `idor-deep-links.spec.ts`._
- [x] 3.1a Logged-in → /login redirect
- [x] 3.1b Logged-in → /register redirect
- [x] 3.1c Logged-in → / redirect
- [x] 3.1d /verify-email NOT redirected
- [x] 3.1e Non-admin → /admin/* → /unauthorized
- [x] 3.1f Unauthenticated → return URL preserved
- [x] 3.1g After login, redirect to original deep link
- [x] 3.1h Banned user post-session-revoke

## Phase 4 — Integration Tests

_Files under `lib/test/integration/**`._
- [x] #1 Tenant isolation — `auth/auth.idor.test.ts`
- [x] #2 Public job queries (dual-gate) — `jobs/public-job-queries.test.ts`
- [x] #3 Apply route (snapshot, audit trail) — `jobs/apply.test.ts`
- [x] #4 Status + bulk status routes — `applications/status.test.ts`, `applications/bulk-status.test.ts`
- [x] #5 Revert route (audit integrity) — `applications/revert.test.ts`
- [x] #6 Resume routes (cap, soft-delete, primary) — `user/resumes.test.ts`
- [x] #7 AI enhance route (DB rate limit) — `ai-enhance/route.perf.test.ts` (Phase 7 PF5)
- [~] #8 Message routes (rate limit, tenant isolation) — thread isolation via `auth.idor.test.ts`; no dedicated message-route integration file
- [x] #9 Bookmarks route (toggle idempotency, concurrent) — `user/bookmarks.test.ts`
- [x] #10 CSV export route — `applications/export.test.ts` (+ Phase 7 PF3)
- [x] #11 Ban + sessions routes — `admin/ban.test.ts`, `admin/sessions.test.ts`
- [x] #12 Withdraw route (status gate) — `applications/withdraw.test.ts`
- [x] #13 File download route (auth matrix) — `files/download.test.ts`
- [x] #14 Analytics routes (SQL injection prevention) — `analytics/analytics.test.ts` + `security/analytics-queries.security.test.ts`
- [x] #15 Notifications route (cross-user isolation) — `notifications.test.ts`
- [x] #16 Role change route (mass assignment) — `admin/role.test.ts`
- [~] #17 Upload route — `upload.test.ts` (401 + happy path only; edge cases U1–U6 pending)

### File Upload & Download Edge Cases
- [x] U1 File type bypass (exe → pdf) — unit `upload-security.test.ts` (MIME allow-list)
- [x] U2 File size >10MB → 413 — unit `upload-security.test.ts` (5 MB limit enforced in `saveUpload`)
- [x] U3 Path traversal in download — `files/download.test.ts` (raw + encoded → 403)
- [x] U4 Empty file upload — `saveUpload` rejects 0-byte files (returns 422 via route)
- [x] U5 Corrupted multipart → 400 — `upload.test.ts` (route catches `formData()` failure)
- [x] U6 Concurrent multi-role downloads — `files/download.test.ts` (owner/recruiter/admin 200, stranger 403)

### Notification Permissions & Delivery
- [x] N1 Cross-user notification isolation — `notifications.test.ts`
- [x] N2 Invalid userId in create — `lib/notifications.ts` validates user exists
- [x] N3 Mark-read ownership — `notifications.test.ts`
- [x] N4 triggerForCompany excludes self — `lib/test/unit/notifications.test.ts`
- [x] N5 Empty company team returns [] — `lib/test/unit/notifications.test.ts`
- [x] N6 Fire-and-forget (Pusher failure non-blocking) — `lib/test/unit/notifications.test.ts`

### Search & Full-Text
- [x] S1 Special chars in search — `unit/search-query.test.ts` (splits on metachars, no token merge)
- [x] S2 Empty search → all results — `unit/search-query.test.ts` + `jobs/public-job-queries.test.ts`
- [x] S3 Very long search string — `unit/search-query.test.ts` (200 char / 20 token cap) + integration
- [x] S4 Unicode search terms — `unit/search-query.test.ts` + `jobs/public-job-queries.test.ts`
- [x] S5 SQL payloads in search — `security/analytics-queries.security.test.ts` + `unit/search-query.test.ts`

### Pagination Boundaries
_All covered by unit `unit/pagination.test.ts` (2.3)._
- [x] P1 Negative page → 1
- [x] P2 Zero page size → minimum
- [x] P3 Page size 100000 → 100
- [x] P4 Invalid cursor → first page
- [x] P5 Overflow page → empty + correct total
- [x] P6 Deleted cursor items

### Audit Trail Integrity
- [x] A1 Status change fromStatus match — `applications/status.test.ts`
- [x] A2 Revert audit correctness — `applications/revert.test.ts`
- [x] A3 Bulk status creates audit rows — `applications/bulk-status.test.ts`
- [x] A4 Withdraw creates audit — `applications/withdraw.test.ts` (schema `onDelete: SetNull` preserves row)
- [x] A5 First status change (apply) — `jobs/apply.test.ts`

### Error Handling & Information Leakage
- [x] E1 Production error shape (no stack traces) — `unit/api-wrapper.test.ts`
- [x] E2 404 vs 403 distinction — `files/download.test.ts` + cross-company 403 tests
- [x] E3 Validation error field names — `unit/api-response.test.ts` / schema suites
- [x] E4 API wrapper consistency — `unit/api-wrapper.test.ts`

### Email & Notification Delivery
- [x] M1 Resend not called for banned — `app/features/auth/libs/email.ts` (sendEmail skips banned userId)
- [x] M2 Notification non-blocking — `lib/notifications.ts` (`void` trigger)
- [x] M3 Missing Pusher config — `lib/pusher/pusher.ts` returns no-op Proxy

### Concurrent Operations & Race Conditions
- [x] C1 Concurrent status transitions — `applications/race.test.ts` (loser → 409 ConflictError)
- [x] C2 Concurrent set-primary — `user/resumes.test.ts` (exactly one primary via $transaction)
- [x] C3 Concurrent bookmark toggle — `user/bookmarks.test.ts`
- [x] C4 Withdraw race with status change — `applications/race.test.ts` (hard-delete; consistent end state)

## Phase 5 — Component Tests

_Files under `lib/test/components/**`. 16 of 16 implemented._
- [x] `data-table.dom.test.tsx`
- [x] `applicants-table.dom.test.tsx`
- [x] `bulk-reject-dialog.dom.test.tsx`
- [x] `status-timeline.dom.test.tsx`
- [x] `resume-builder-form.dom.test.tsx`
- [x] `ai-suggestions-panel.dom.test.tsx`
- [x] `job-search-bar.dom.test.tsx`
- [x] `save-job-button.dom.test.tsx`
- [x] `account-popover.dom.test.tsx`
- [x] `apply-modal.dom.test.tsx`
- [x] `chat-input-area.dom.test.tsx`
- [x] `message-bubble.dom.test.tsx`
- [x] `shared-thread-view.dom.test.tsx`
- [x] `thread-list-item.dom.test.tsx`
- [x] `chat-header.dom.test.tsx`
- [x] `no-company-prompt.dom.test.tsx` (NoCompanyPrompt extracted to its own component)

## Phase 6 — E2E (Playwright)

_Specs under `e2e/specs/**`._
- [x] Setup: `playwright.config.ts`
- [x] Setup: `e2e/global.setup.ts`
- [x] Setup: `e2e/seed-e2e.ts` (was listed as `prisma/seed-e2e.ts`)
- [x] `anonymous-apply-redirect.spec.ts`
- [x] `user-apply-flow.spec.ts`
- [x] `recruiter-pipeline.spec.ts`
- [x] `recruiter-bulk-reject.spec.ts`
- [x] `admin-ban-user.spec.ts`
- [x] `messaging-roundtrip.spec.ts`
- [x] `ai-resume-enhance.spec.ts`
- [x] `csv-export.spec.ts`
- [x] `cross-role-access.spec.ts`
- [x] `idor-deep-links.spec.ts`

## Phase 7 — Performance & Stability

_Perf project (`--project perf`, 300s timeout), files `**/*.perf.test.ts`._
- [x] PF1 Analytics large date range (5 years, <5s) — `recruiter/queries/analytics-queries.perf.test.ts`
- [x] PF2 Applicant list 10K+ (<500ms) — `recruiter/queries/application-queries.perf.test.ts`
- [x] PF3 CSV export 50K (<30s, <512MB) — `recruiter/queries/export-queries.perf.test.ts`
- [x] PF4 Job listing 100K (<1s, indexed) — `jobs/queries/public-job-queries.perf.test.ts`
- [x] PF5 Concurrent AI requests (5/day cap) — `ai-enhance/route.perf.test.ts`

### Rate Limiter Behavior
_All covered by `lib/test/unit/rate-limit.test.ts`._
- [x] RL1 In-memory reset (document gap)
- [x] RL2 Key isolation across users
- [x] RL3 Concurrent request counting
- [x] RL4 Pruning preserves active keys
- [x] RL5 Zero-limit config

## Phase 8 — CI & Coverage

- [x] 8.1 Coverage thresholds set to measured floor — lines/statements 22, functions 54, branches 67 (just below the measured ~24.5 / 57 / 70 for the CI command `--project default --project dom --coverage`, so coverage cannot regress)
- [~] 8.2 Raise thresholds to 60% — deferred: requires substantial new tests (line coverage is ~24.5%); ratchet up in follow-up PRs as coverage grows
- [~] 8.3 Raise thresholds to 70% — deferred: same rationale, after 8.2
- [x] 8.4 `.github/workflows/test.yml` (unit-integration + e2e on master push & PRs; perf on master push / dispatch)

_Note: fire-and-forget notification writes (`fireNotification`) now swallow+log
their own rejections, so the coverage job no longer flakes on a background
`Notification` FK error racing with `resetDb()`._

---

## Security Audit Checklist (Manual)

### Authentication & Sessions
- [ ] All role-based redirects (middleware matrix)
- [ ] Banned user sessions immediately invalidated
- [ ] Password reset revokes all sessions
- [ ] /verify-email accessible to authenticated users

### Authorization & Data Boundaries
- [ ] File upload/download auth matrix (all 4 roles)
- [ ] Cross-recruiter data isolation
- [ ] Cross-user data isolation
- [ ] Admin cannot modify super-admin
- [ ] URL ID manipulation → 403/404

### Input & Injection
- [ ] SQL metacharacters in analytics filters → Zod rejection
- [ ] Job search special chars → sanitized
- [ ] File type validation (renamed extensions)
- [ ] Message content XSS (rendered as text)

### Real-time & External Services
- [ ] Pusher multi-role connectivity
- [ ] Pusher channel isolation
- [ ] AI rate limit + fallback
- [ ] Email not sent to banned users

### Data Integrity
- [ ] Bulk operations atomic
- [ ] Resume snapshot survives deletion
- [ ] Concurrent operations safe
- [ ] Audit trail complete

### SEO & Public Access
- [ ] Sitemap + robots.txt correctness
- [ ] JSON-LD structured data validation
- [ ] Draft/archived/deactivated jobs never public
