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

## Phase 1 — Input Validation & Schema Hardening

### SQL Injection Prevention
- [ ] 1.a1 `analytics-queries.security.test.ts` (SQL payloads in all 7 filter params)
- [ ] 1.a2 `analytics.schema.test.ts` (enum enforcement on status/workMode/employmentType/jobId UUID)

### Input Edge Cases
- [ ] 1.b1 `profile.schema.test.ts` (caps, Unicode, empties, duplicates)
- [ ] 1.b2 `resume.schema.test.ts`
- [ ] 1.b3 `resume-ai.schema.test.ts`
- [ ] 1.b4 `application-submit.schema.test.ts` (char limits, null bytes, UUID format)
- [ ] 1.b5 `job.schema.test.ts` (Unicode, salary range validation)
- [ ] 1.b6 `auth.schema.test.ts` (email format, password policies)
- [ ] 1.b7 `admin.schema.test.ts` (HTML/SQL in banReason, role enum)

### Mass Assignment Prevention
- [ ] 1.c1 `PATCH /api/admin/users/[id]/role` (extra fields ignored)
- [ ] 1.c2 `POST /api/jobs/[id]/apply` (status override rejected)
- [ ] 1.c3 `PATCH /api/user/resumes/[id]` (immutable fields protected)
- [ ] 1.c4 `PATCH /api/recruiter/jobs/[id]` (companyId/viewCount protected)

## Phase 2 — Unit Tests

- [ ] 2.1 `lib/rate-limiter.test.ts` (includes key isolation, concurrency)
- [ ] 2.2 `csv-builder.test.ts` (includes Unicode)
- [ ] 2.3 `lib/pagination.test.ts` (includes boundary edge cases)
- [ ] 2.4 `lib/api-error.test.ts` (includes error message leak test)
- [ ] 2.5 `lib/routes.test.ts`
- [ ] 2.6 `lib/job-categories.test.ts`
- [ ] 2.7 `rate-limit-message.test.ts` (includes pair isolation)
- [ ] 2.8 `lib/ai-client.test.ts` (environment selection)
- [ ] 2.9 Zod schemas — all 11 schemas (valid, invalid, caps, Unicode, null bytes)
- [ ] 2.10 `require-role.test.ts`
- [ ] 2.11 `lib/validator.test.ts`
- [ ] 2.12 `presence-store.test.ts`
- [ ] 2.13 `applicant-table-utils.test.ts`
- [ ] 2.14 `lib/ai-client.test.ts` (expanded: all 3 providers, error shapes)

## Phase 3 — Authentication & Authorization Tests

### Session & Token Security
- [ ] 3.0a Expired session → 401
- [ ] 3.0b Malformed token → 401
- [ ] 3.0c Missing auth → 401
- [ ] 3.0d User → /admin/* → 403
- [ ] 3.0e Admin → /recruiter/* → 403
- [ ] 3.0f Banned user with session → 401
- [ ] 3.0g Super admin bypass

### IDOR Protection (all resource types)
- [ ] 3.I1 Application detail
- [ ] 3.I2 Job management
- [ ] 3.I3 Resume
- [ ] 3.I4 Profile
- [ ] 3.I5 Thread
- [ ] 3.I6 Message
- [ ] 3.I7 Notification
- [ ] 3.I8 Bookmark
- [ ] 3.I9 Admin user actions

### Middleware & Redirect
- [ ] 3.1a Logged-in → /login redirect
- [ ] 3.1b Logged-in → /register redirect
- [ ] 3.1c Logged-in → / redirect
- [ ] 3.1d /verify-email NOT redirected
- [ ] 3.1e Non-admin → /admin/* → /unauthorized
- [ ] 3.1f Unauthenticated → return URL preserved
- [ ] 3.1g After login, redirect to original deep link
- [ ] 3.1h Banned user post-session-revoke

## Phase 4 — Integration Tests

- [ ] #1 Tenant isolation
- [ ] #2 Public job queries (dual-gate)
- [ ] #3 Apply route (snapshot, rate limit, audit trail)
- [ ] #4 Status + bulk status routes (concurrent safety)
- [ ] #5 Revert route (audit integrity)
- [ ] #6 Resume routes (cap, soft-delete, concurrent primary)
- [ ] #7 AI enhance route (DB rate limit, null-fallback)
- [ ] #8 Message routes (rate limit, tenant isolation)
- [ ] #9 Bookmarks route (toggle idempotency, concurrent)
- [ ] #10 CSV export route (50K cap, streaming)
- [ ] #11 Ban + sessions routes
- [ ] #12 Withdraw route (status gate, concurrent safety)
- [ ] #13 File download route (auth matrix, path traversal)
- [ ] #14 Analytics routes (SQL injection prevention, large date range)
- [ ] #15 Notifications route (cross-user isolation)
- [ ] #16 Role change route (mass assignment)
- [ ] #17 Upload route (file type bypass, size limit, empty/corrupted)

### File Upload & Download Edge Cases
- [ ] U1 File type bypass (exe → pdf)
- [ ] U2 File size >10MB → 413
- [ ] U3 Path traversal in download
- [ ] U4 Empty file upload
- [ ] U5 Corrupted multipart → 400
- [ ] U6 Concurrent multi-role downloads

### Notification Permissions & Delivery
- [ ] N1 Cross-user notification isolation
- [ ] N2 Invalid userId in create
- [ ] N3 Mark-read ownership
- [ ] N4 triggerForCompany exclude self
- [ ] N5 Empty company team
- [ ] N6 Fire-and-forget

### Search & Full-Text
- [ ] S1 Special chars in search
- [ ] S2 Empty search → all results
- [ ] S3 Very long search string
- [ ] S4 Unicode search terms
- [ ] S5 SQL payloads in search

### Pagination Boundaries
- [ ] P1 Negative page → 1
- [ ] P2 Zero page size → minimum
- [ ] P3 Page size 100000 → 100
- [ ] P4 Invalid cursor → first page
- [ ] P5 Overflow page → empty + correct total
- [ ] P6 Deleted cursor items

### Audit Trail Integrity
- [ ] A1 Status change fromStatus match
- [ ] A2 Revert audit correctness
- [ ] A3 Bulk status creates audit rows
- [ ] A4 Withdraw creates audit
- [ ] A5 First status change (apply)

### Error Handling & Information Leakage
- [ ] E1 Production error shape (no stack traces)
- [ ] E2 404 vs 403 distinction
- [ ] E3 Validation error field names
- [ ] E4 API wrapper consistency

### Email & Notification Delivery
- [ ] M1 Resend not called for banned
- [ ] M2 Notification non-blocking
- [ ] M3 Missing Pusher config

### Concurrent Operations & Race Conditions
- [ ] C1 Concurrent status transitions
- [ ] C2 Concurrent set-primary
- [ ] C3 Concurrent bookmark toggle
- [ ] C4 Withdraw race with status change

## Phase 5 — Component Tests

- [ ] `data-table.dom.test.tsx`
- [ ] `applicants-table.dom.test.tsx`
- [ ] `bulk-reject-dialog.dom.test.tsx`
- [ ] `status-timeline.dom.test.tsx`
- [ ] `resume-builder-form.dom.test.tsx`
- [ ] `ai-suggestions-panel.dom.test.tsx`
- [ ] `job-search-bar.dom.test.tsx`
- [ ] `save-job-button.dom.test.tsx`
- [ ] `account-popover.dom.test.tsx`
- [ ] `apply-modal.dom.test.tsx`
- [ ] `chat-input-area.dom.test.tsx`
- [ ] `message-bubble.dom.test.tsx`
- [ ] `shared-thread-view.dom.test.tsx`
- [ ] `thread-list-item.dom.test.tsx`
- [ ] `chat-header.dom.test.tsx`
- [ ] `no-company-prompt.dom.test.tsx`

## Phase 6 — E2E (Playwright)

- [ ] Setup: `playwright.config.ts`
- [ ] Setup: `e2e/global.setup.ts`
- [ ] Setup: `prisma/seed-e2e.ts`
- [ ] `anonymous-apply-redirect.spec.ts`
- [ ] `user-apply-flow.spec.ts`
- [ ] `recruiter-pipeline.spec.ts`
- [ ] `recruiter-bulk-reject.spec.ts`
- [ ] `admin-ban-user.spec.ts`
- [ ] `messaging-roundtrip.spec.ts`
- [ ] `ai-resume-enhance.spec.ts`
- [ ] `csv-export.spec.ts`
- [ ] `cross-role-access.spec.ts`
- [ ] `idor-deep-links.spec.ts`

## Phase 7 — Performance & Stability

- [ ] PF1 Analytics large date range (5 years, <5s)
- [ ] PF2 Applicant list 10K+ (<500ms)
- [ ] PF3 CSV export 50K (<30s, <512MB)
- [ ] PF4 Job listing 100K (<1s, indexed)
- [ ] PF5 Concurrent AI requests (5/day cap)

### Rate Limiter Behavior
- [ ] RL1 In-memory reset (document gap)
- [ ] RL2 Key isolation across users
- [ ] RL3 Concurrent request counting
- [ ] RL4 Pruning preserves active keys
- [ ] RL5 Zero-limit config

## Phase 8 — CI & Coverage

- [ ] 8.1 Raise thresholds to 45% (after Phase 1+2)
- [ ] 8.2 Raise thresholds to 60% (after Phase 3+4)
- [ ] 8.3 Raise thresholds to 70% (after Phase 5+6)
- [ ] 8.4 `.github/workflows/test.yml`

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
