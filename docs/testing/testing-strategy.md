# Testing Strategy

## Overview

The application currently has zero automated tests. This strategy defines the testing approach, stack, and test plans to be implemented incrementally across phases. Tests are prioritized by risk — critical data integrity, security, and authorization paths are tested first.

## Testing Stack

| Concern | Choice | Rationale |
|---|---|---|
| Unit/Integration | Vitest | Native ESM/TS, fast, clean Next.js 16 + React 19 compatibility |
| Component Testing | @testing-library/react + jest-dom | Standard React testing, works in Vitest via jsdom environment |
| API Route Testing | Vitest (direct handler import) | App Router handlers are plain functions — no server needed |
| Database Integration | Real Postgres test DB + Prisma, truncate between tests | Mocking Prisma hides real constraint and transaction bugs |
| External Services | `vi.mock()` for Pusher SDK, AI client, Resend | Node SDKs — module mocking is simpler than network interception |
| End-to-End | Playwright | Multi-role auth via `storageState`, real browser for Better Auth cookies, file upload, real-time UI |
| Coverage | @vitest/coverage-v8 | Built-in with no extra configuration |

## Testing Environments

- **`node` environment** — Unit tests (`*.test.ts`): pure logic, no DOM or database
- **`jsdom` environment** — Component tests (`*.dom.test.tsx`): React components with RTL
- **Real test database** — Integration tests: route handlers tested against a real Postgres test database with schema migrations applied

## Phase 0 — Test Infrastructure

### Configuration

A `vitest.config.ts` at project root configures:
- `@vitejs/plugin-react` and `vite-tsconfig-paths` plugins
- Default `node` environment with `jsdom` for `*.dom.test.*` files
- Setup files: `lib/test/vitest.setup.ts`, `lib/test/global-setup.ts`
- Coverage thresholds starting at 35% (lines, functions, statements) and 30% (branches)

### Test Database

A dedicated local PostgreSQL database (`hireflow_test`) is created and connected via the `DATABASE_URL_TEST` environment variable in `.env.test`.

### Global Setup (`lib/test/global-setup.ts`)

Runs `prisma migrate deploy` against the test database to ensure schema parity before any test runs.

### Test Database Utilities

- **`lib/test/test-db.ts`** — Isolated Prisma client for tests using `@prisma/adapter-pg`
- **`lib/test/reset-db.ts`** — Table truncation with `RESTART IDENTITY CASCADE` in dependency order; called in `beforeEach` of every integration test
- **`lib/test/factories.ts`** — Test data factories using `@faker-js/faker`: `createTestUser()`, `createTestCompany()`, `createTestJob()`, `createTestApplication()`. Extended with `createTestResume()`, `createTestThread()` as needed.

### Auth Fixtures (`lib/test/auth-fixtures.ts`)

`mockSession(role, overrides)` returns a mock Better Auth session. Tests mock `@/lib/auth` with `vi.mock()` and set `auth.api.getSession` per test.

### External Service Mocks (`lib/test/mocks.ts`)

- `mockPusherTrigger()` — Mocks `pusherServer.trigger`
- `mockAiClient(response)` — Mocks `callAI` return value
- `mockResend()` — Mocks Resend `emails.send`

### Scripts

Added to `package.json`:
- `test` — `vitest run`
- `test:watch` — `vitest`
- `test:coverage` — `vitest run --coverage`
- `test:e2e` — `playwright test`
- `test:e2e:ui` — `playwright test --ui`

---

## Phase 1 — Input Validation & Schema Hardening

All user-supplied data must pass rigorous validation before reaching database queries. This phase hardens Zod schemas and validates edge cases found in production patterns.

### SQL Injection Prevention in Raw Queries

The analytics module uses Prisma `$queryRawUnsafe` with string-interpolated values from user-supplied filter parameters. While Zod validates presence and type, it does not restrict character content.

| Source | Test File | Cases |
|---|---|---|
| `analytics-queries.ts` `buildWhereClauses()` | `analytics-queries.security.test.ts` | Pass `status="'; DROP TABLE \"application\"; --"` → rejected or sanitized by Zod before hitting DB; `workMode` with SQL metacharacters (`'`, `;`, `--`, `/*`) → rejected; `employmentType` with SQL payload → rejected; `location` with SQL payload → rejected; `jobId` must match UUID format (not arbitrary string); `dateFrom`/`dateTo` must match ISO date format |
| `analytics.schema.ts` | `analytics.schema.test.ts` | Filter `status` values not in `APPLICATION_STATUSES` enum rejected; `workMode` values not in `WorkMode` enum rejected; `employmentType` values not in `EmploymentType` enum rejected; `jobId` not a UUID rejected; `dateFrom`/`dateTo` not ISO dates rejected |

### Input Edge Cases Across All Schemas

| Schema | Test Cases |
|---|---|
| `profile.schema.ts` | Extremely long strings (10K+ chars) truncated or rejected; Unicode and emoji in `headline`/`bio` accepted; empty array for `skills` accepted; `skills` with 51 items rejected; `experiences` with 21 items rejected; `socialLinks` with 11 items rejected; duplicate skill entries deduplicated; zero-value salary fields accepted |
| `resume.schema.ts` | `label` with Unicode and special characters; `educations` array with 0 items; `experiences` array with 0 items; `skills` array with 0 items; nested objects with missing required fields |
| `resume-ai.schema.ts` | Empty suggestions array; malformed JSON in suggestion payloads; missing required fields on individual suggestions |
| `application-submit.schema.ts` | `coverLetter` exactly 5000 chars accepted; `coverLetter` 5001 chars rejected; `coverLetter` with null bytes rejected; `resumeId` not a UUID rejected; extra unknown fields in body silently stripped |
| `job.schema.ts` | `title` with Unicode and HTML entities; `description` with markdown; `locations` empty array; `skills` empty array; `salaryMin > salaryMax` rejected; `applicationDeadline` in the past accepted (recruiter may need to edit legacy posts) |
| `auth.schema.ts` | `email` with Unicode domains rejected; `email` with SQL injection payloads rejected by email format validator; `password` below minimum length rejected; `password` only whitespace rejected |
| `admin.schema.ts` | `banReason` with HTML/SQL payloads; `banExpiresAt` in the past accepted (for retroactive recording); `role` not in `Role` enum rejected |

### Mass Assignment (Over-Posting) Prevention

| Route | Test Cases |
|---|---|
| `PATCH /api/admin/users/[id]/role` | Extra fields (`banned`, `name`, `email`) in request body silently ignored; only `role` field applied |
| `POST /api/jobs/[id]/apply` | Extra fields beyond `resumeId` and `coverLetter` stripped; `status` field cannot be overridden |
| `PATCH /api/user/resumes/[id]` | Only `isPrimary` and `builderData` fields modifiable; `fileUrl`, `userId`, `deletedAt` cannot be changed |
| `PATCH /api/recruiter/jobs/[id]` | `companyId` cannot be changed; `viewCount` cannot be overridden |
| All `upsert` server actions | Extra fields silently discarded by Zod `.parse()` |

---

## Phase 2 — Unit Tests: Pure Logic

Focus on pure functions with no database or network dependencies. Test files colocated next to source files.

### Test Inventory

| Source File | Test File | Cases |
|---|---|---|
| `lib/rate-limiter.ts` | `lib/rate-limiter.test.ts` | Allows under limit, blocks at limit, resets after window, isolates by key, cleanup timer; parallel requests within window all count correctly; key collision proof — two users with different keys do not share limit |
| `app/features/recruiter/libs/csv-builder.ts` | `csv-builder.test.ts` | RFC 4180 escaping (commas, quotes, newlines), BOM prefix, empty dataset → header-only; Unicode content escaped correctly |
| `lib/pagination.ts` | `lib/pagination.test.ts` | Offset math at page 1/N, cursor encode/decode round-trip, negative/zero page guards; page=0 defaults to 1; pageSize=100000 caps at 100; invalid cursor returns first page |
| `lib/api-error.ts` + `lib/api-response.ts` | `lib/api-error.test.ts` | Each error class maps to correct HTTP status via api-wrapper; error messages do not leak internal paths; ZodError→422 includes field-level details; unknown errors → 500 without stack traces |
| `lib/routes.ts` | `lib/routes.test.ts` | `isHiddenRoute` true/false matrix across all route categories; `/jobs/` prefix sub-routes handled; invite-prefix routes hidden |
| `lib/job-categories.ts` | `lib/job-categories.test.ts` | Category → filter mapping completeness; each category has valid filter shape |
| `app/features/recruiter/libs/rate-limit-message.ts` | `rate-limit-message.test.ts` | 20/hr boundary, per-pair isolation; pair (A→B) does not consume (B→A) limit |
| `lib/ai-client.ts` | `lib/ai-client.test.ts` | Provider selection via `AI_PROVIDER` env, returns null when key missing |

### Zod Schema Tests

For each schema file, test:
- 1 valid payload passes
- 3-5 invalid payloads fail with expected `.issues[].path`
- Edge cases for caps: skills ≤50, experiences ≤20, socialLinks ≤10, coverLetter ≤5000
- Unicode strings accepted
- Null bytes rejected
- HTML/script injection payloads — accepted as data (escaping is a rendering concern) or rejected if field is enum/constrained

Schemas to test: `profile.schema.ts`, `resume.schema.ts`, `resume-ai.schema.ts`, `application-submit.schema.ts`, `job.schema.ts`, `admin.schema.ts`, `company.schema.ts`, `team.schema.ts`, `analytics.schema.ts`, `auth.schema.ts`, `notification.schema.ts`

### Additional Unit Tests (Post-Implementation Additions)

| Source File | Test File | Cases |
|---|---|---|
| `app/features/shared/api/require-role.ts` | `require-role.test.ts` | Returns session for allowed roles; throws UnauthorizedError when no session; throws ForbiddenError for disallowed roles; resolves companyId/memberRole for recruiters on allowed team; super_admin passes admin checks; recruiter without company membership throws 403 |
| `lib/validator.ts` | `lib/validator.test.ts` | Returns success + typed data for valid Zod input; returns failure + flattened errors for invalid input; nested object errors flatten correctly |
| `features/messages/stores/presence-store.ts` | `presence-store.test.ts` | Set/clear user presence; subscribe to thread presence changes; presence persists across store resets; disconnected users removed |
| `app/features/recruiter/components/applicant-table-utils.ts` | `applicant-table-utils.test.ts` | Status transition intersection logic returns correct common transitions; empty selection returns empty set; single-identity edge cases |
| `lib/ai-client.ts` (expanded) | `lib/ai-client.test.ts` | All 3 providers return expected response shape; each provider's error response throws ApiError(502); missing API key for each specific provider returns null; unexpected provider env var falls back to null; each provider's error response body parsed correctly |

---

## Phase 3 — Authentication & Authorization Tests

These are pure integration tests against real route handlers and a real test DB. They validate that auth boundaries hold across the entire system.

### Session & Token Security

| # | Scenario | Assertions |
|---|---|---|
| 3.0a | Expired session token | All protected routes return 401, never 500 |
| 3.0b | Malformed session token | All protected routes return 401, never 500 |
| 3.0c | Missing auth header | All protected routes return 401 |
| 3.0d | Cross-role access — `user` hitting `/admin/*` | Returns 403, never 404 or leaked data |
| 3.0e | Cross-role access — `admin` hitting `/recruiter/*` | Returns 403, never 404 or leaked data |
| 3.0f | Banned user with valid session | All subsequent requests return 401 (session revoked) |
| 3.0g | Super admin bypass | Super admin passes all admin-only checks including team management |

### IDOR (Insecure Direct Object Reference) Protection — Every Resource

For each resource type below, test: **User A cannot access User B's resource** (expect 403 or 404, never the actual data).

| Resource | URL Param(s) | Auth Scope |
|---|---|---|
| Application detail | `[applicationId]` | Owner (`userId`) or recruiter of job's company |
| Job management | `[id]` | Recruiter of job's company or admin |
| Resume | `[id]` | Owner (`userId`) |
| Profile | implicit (session) | Owner only |
| Thread | `[threadId]` | Either participant of the thread |
| Message | `[messageId]` | Either participant of the parent thread |
| Notification | (query param) | Recipient only |
| Bookmark | `[jobId]` | Owner of bookmark |
| Admin actions | `[id]` (user) | Admin/super_admin only; super_admin cannot be targeted |

### Middleware & Redirect

| # | Scenario | Assertions |
|---|---|---|
| 3.1a | Logged-in user on `/login` | Redirected to role-specific landing |
| 3.1b | Logged-in user on `/register` | Redirected to role-specific landing |
| 3.1c | Logged-in user on `/` | Redirected to role-specific landing |
| 3.1d | Logged-in user on `/verify-email` | **NOT** redirected (special-cased in middleware) |
| 3.1e | Non-admin on `/admin/*` | Redirected to `/unauthorized` |
| 3.1f | Unauthenticated on protected route | Redirected to `/login` with return URL preserved in `callbackUrl` |
| 3.1g | After login with return URL | User redirected to the original deep link, not role home |
| 3.1h | Banned user after session revocation | Banned user's next authenticated request returns 401; new login attempt blocked |

---

## Phase 4 — Integration Tests: API Routes + Real Test DB

Route handlers called directly with `new Request()`. Real test database with `resetDb()` in `beforeEach`. Mocked auth session, Pusher/AI/Resend.

### Priority Order (by risk)

| # | Route(s) | Risk If Broken | Key Assertions |
|---|---|---|---|
| 1 | `require-admin.ts`, tenant-scoped recruiter queries | Cross-tenant data leak | Recruiter A cannot fetch/mutate Company B's jobs/applicants (expect 403/404, not empty array) |
| 2 | `public-job-queries.ts` | Leaked archived/deactivated jobs | Job with status:"draft" OR isActive:false never appears in public results, even with other flag true |
| 3 | `apply/route.ts` | Bad applications, no audit trail | Duplicate apply blocked, 11th request/min → 429, resume snapshot frozen correctly, first ApplicationStatusChange created with fromStatus: null; apply with non-existent resumeId → validation error; apply for archived job → rejected |
| 4 | `status/route.ts` + `bulk/status/route.ts` | Corrupted pipeline state | Valid transition succeeds + audit + notification; invalid transition (hired→applied) rejected; bulk is atomic (mid-batch failure → zero rows changed); concurrent status transitions on same application — only one succeeds |
| 5 | `revert/route.ts` | Silent data loss | Reverts to prior status from audit trail, not hardcoded; creates audit + notification row with correct fromStatus/toStatus |
| 6 | `resumes/route.ts` + `[id]/route.ts` | Cap bypass, data loss | 6th resume upload rejected, soft-delete sets deletedAt preserving file, set-primary via $transaction leaves exactly one primary; concurrent set-primary → still exactly one primary |
| 7 | `ai-enhance/route.ts` | Cost overrun, silent AI failure | 6th call same day → 429, missing API key → graceful null fallback (not 500), suggestions never auto-applied; DB-backed rate limit persists across test restarts |
| 8 | `messages/[threadId]/route.ts` (recruiter + admin) | Rate-limit + notification regressions | 21st message/hr → 429, Pusher trigger called with correct channel, createNotification called exactly once; message to applicant outside recruiter's company rejected |
| 9 | `bookmarks/route.ts` | Duplicate/broken toggle | POST twice on same job toggles create→delete, respects @@unique constraint; concurrent bookmark toggle does not create duplicates |
| 10 | `export/route.ts` | Wrong/leaked export data | CSV respects active filters, excludes other companies' applicants, streaming doesn't truncate above cap; 50K row limit respected |
| 11 | `ban/route.ts` + `sessions/route.ts` | Banned user retains access | Ban sets flag + revokes all sessions; subsequent authenticated request rejected; new login attempts blocked after ban |
| 12 | `applications/[id]/route.ts` (withdraw) | Withdraw after interview scheduled | Withdraw allowed only when applied/reviewing; gate rejects otherwise; concurrent withdraw + status change — withdraw should fail if status already changed |
| 13 | `files/download/route.ts` | Resume leak | Owner ✅, related recruiter ✅, unrelated recruiter ❌ (403), admin ✅; path traversal in filename rejected; non-existent fileId → 404 |
| 14 | `analytics/route.ts` + `jobs/[id]/analytics/route.ts` | SQL injection via filter params | All filter params sanitized or rejected; very large date range (5 years) returns results; empty date range returns defaults; filter params with SQL metacharacters rejected at Zod level |
| 15 | `notifications/route.ts` | Missing post-implementation fields | Returns notifications with correct type discriminator; data JSON parsed correctly; pagination respects cursor; side-effect free GET; User A cannot read User B's notifications |
| 16 | `PATCH /api/admin/users/[id]/role` | Mass assignment | Extra fields in body silently ignored; only role changes applied; role validated against Role enum; super_admin role cannot be changed by regular admin |
| 17 | `POST /api/upload/route.ts` | File type bypass | Renamed `.exe` → `.pdf` rejected by content-type detection; file >10MB returns 413; empty file rejected; corrupted multipart body rejects gracefully |

### File Upload & Download Edge Cases

| # | Scenario | Assertions |
|---|---|---|
| U1 | File type validation bypass | `.exe` renamed to `.pdf` — rejected by magic bytes check or content sniffing |
| U2 | File size limit | 10MB+1 byte file returns 413, not 500 or truncated |
| U3 | Path traversal in download | `/../../etc/passwd` → sanitized or rejected |
| U4 | Empty file upload | Returns validation error, not stored |
| U5 | Corrupted multipart body | Returns 400, not 500 |
| U6 | Concurrent downloads | Multiple roles (owner, recruiter, admin, unrelated) downloading simultaneously — auth matrix holds; no race condition on file stream |

### Notification Permissions & Delivery

| # | Scenario | Assertions |
|---|---|---|
| N1 | Cross-user read | User A cannot read User B's notifications |
| N2 | Invalid userId in create | `createNotification()` validates userId exists |
| N3 | Mark-as-read ownership | Only notification owner can mark as read |
| N4 | triggerForCompany excludes self | `excludeUserId` option excludes the action performer |
| N5 | Empty company team | `triggerForCompany` with 0 members returns empty array, no error |
| N6 | Fire-and-forget | Notification creation does not block API response |

### Search & Full-Text

| # | Scenario | Assertions |
|---|---|---|
| S1 | Prisma `search` special chars | `&`, `\|`, `!`, `*`, `(`, `)` in search query → sanitized by regex before Prisma call |
| S2 | Empty search string | Returns all results, not all-none |
| S3 | Very long search string | Does not crash; query truncates to safe length |
| S4 | Unicode search terms | Works correctly with full-text search index |
| S5 | SQL-like payloads in search | `'; SELECT * FROM "user"; --` → sanitized to space-separated words |

### Pagination Boundary Tests

| # | Scenario | Assertions |
|---|---|---|
| P1 | Negative page number | Defaults to page 1, returns first page |
| P2 | Zero page size | Defaults to configurable minimum |
| P3 | Excessively large page size (100000) | Caps at 100 |
| P4 | Invalid cursor value | Returns first page, does not error |
| P5 | Offset overflow (page 9999) | Returns empty array with correct total, no error |
| P6 | Cursor pagination with deleted items | Cursor points to deleted/soft-deleted record — handled gracefully |

### Audit Trail Integrity

| # | Scenario | Assertions |
|---|---|---|
| A1 | Status change fromStatus/applicationId match | Audit row `fromStatus` equals the application's `status` before the change |
| A2 | Revert creates correct audit | Revert row has `fromStatus` = reverted-to status, `toStatus` = application's status before revert |
| A3 | Bulk status audit rows | Every bulk-transitioned application gets its own audit row |
| A4 | Withdraw creates audit | Withdrawn application has an `ApplicationStatusChange` with `fromStatus` = previous status, `toStatus` = "withdrawn" |
| A5 | First status change (apply) | `fromStatus: null`, `toStatus: "applied"`, `changedById` matches applicant (user triggered via apply endpoint) |

### Error Handling & Information Leakage

| # | Scenario | Assertions |
|---|---|---|
| E1 | Production error response shape | All errors return `{ success: false, message: "..." }` — no stack traces, no internal paths |
| E2 | 404 vs 403 distinction for non-existent resources | Non-existent resource returns 404 (does not confirm/deny existence of other records); unauthorized access to existing resource returns 403 |
| E3 | Validation error field exposure | Field-level validation errors included (422); field names are API contract names, not internal DB column names |
| E4 | API wrapper consistency | Route handler errors (regardless of error class) all flow through `withErrorHandler` return shape |

### Email & Notification Delivery

| # | Scenario | Assertions |
|---|---|---|
| M1 | Resend not called for banned users | Banned user triggers no email sends |
| M2 | Notification creation non-blocking | API returns before Pusher trigger completes (fire-and-forget) |
| M3 | Missing Pusher/Twilio config | Notification creation succeeds even when Pusher is unconfigured (no-op fallback) |

### Concurrent Operations & Race Conditions

| # | Scenario | Assertions |
|---|---|---|
| C1 | Concurrent status transitions | Two recruiters change same application simultaneously — OCC ensures only one succeeds |
| C2 | Concurrent set-primary resume | `$transaction` ensures exactly one primary after concurrent sets |
| C3 | Concurrent bookmark toggle | `@@unique` constraint prevents duplicates from concurrent requests |
| C4 | Withdraw race with recruiter status change | Withdraw should fail if status was already changed by recruiter (gate check at time of execution, not time of page load) |

---

## Phase 5 — Component Tests (RTL)

Focus on components with real logic, not pure presentation.

| Component | Test Cases |
|---|---|
| `components/ui/data-table.tsx` | Selection state via selectedIds/onSelectionChange, disabledIds rows unclickable, getRowId used correctly; 0 rows renders correct empty state |
| `applicants-table.tsx` | Bulk action bar appears only when selection non-empty; available bulk actions are the intersection of valid transitions across all selected rows |
| `bulk-reject-dialog.tsx` | Requires reason before submit enabled, calls mutation with all selected IDs |
| `status-timeline.tsx` | Renders correct order from ApplicationStatusChange[] fixture, handles single-entry case; handles `fromStatus: null` (first entry); handles empty array |
| `resume-builder-form.tsx` | useFieldArray add/remove for educations and experiences, skills tag input dedupes; form submission disabled while invalid |
| `ai-suggestions-panel.tsx` | Per-item "Apply" only mutates that one field, "Copy" writes to clipboard (mock `navigator.clipboard`); handles empty suggestions array gracefully |
| `job-search-bar.tsx` | Debounce fires once after typing stops (fake timers), URL query params sync; special characters escaped before URL construction |
| `save-job-button.tsx` | Anonymous click redirects to login with return URL, authenticated click toggles bookmark; optimistic UI update before server confirmation |
| `account-popover.tsx` | Renders correct menu items per role, no "Dashboard" entry for user role; admin gets Dashboard + Users + Team links |
| `apply-modal.tsx` | Submit disabled with no resume selected, validation error on cover letter >5000 chars; resume list shows only non-deleted resumes |
| `components/chat/chat-input-area.tsx` | Input empty → submit disabled; Enter sends; Shift+Enter inserts newline; file attach button present; max char limit enforced; paste event preserves newlines |
| `components/chat/message-bubble.tsx` | Renders text; renders file link; own messages right-aligned with different style; timestamp formatted; deleted message placeholder; XSS via message content rendered as text not HTML |
| `components/chat/shared-thread-view.tsx` | Header with participant; message list; scroll-to-bottom on new message; loading skeleton; error+retry; empty thread renders correctly |
| `components/chat/thread-list-item.tsx` | Unread badge shown; active state highlighted; last message preview truncated to safe length; handles deleted participant gracefully |
| `components/chat/chat-header.tsx` | Participant name/avatar; status indicator (online/offline); back button on mobile; long names truncated |
| `features/recruiter/components/no-company-prompt.tsx` | Renders CTA to create company; link navigates to /recruiter/company |

---

## Phase 6 — End-to-End Tests (Playwright)

### Setup

- `playwright.config.ts` — Projects for anonymous, user, recruiter, admin with separate storageState
- `e2e/global.setup.ts` — Logs in each seeded role via the real UI and saves browser state
- Fixed test accounts seeded in `prisma/seed-e2e.ts` (not production seed data)

### Test Journeys

| # | Journey | File | Assertions |
|---|---|---|---|
| 1 | Anonymous Apply Redirect | `anonymous-apply-redirect.spec.ts` | Browse /jobs → open detail → "Log in to Apply" → redirected to /login with return path preserved |
| 2 | User Apply Flow | `user-apply-flow.spec.ts` | Complete profile → build resume → apply to job → appears in /user/applications with applied status |
| 3 | Recruiter Pipeline | `recruiter-pipeline.spec.ts` | Create job → applicant appears → move through pipeline → status change reflected on user's detail page |
| 4 | Recruiter Bulk Reject | `recruiter-bulk-reject.spec.ts` | Select 3 applicants → bulk reject with reason → all 3 show rejected + audit entries |
| 5 | Admin Ban User | `admin-ban-user.spec.ts` | Ban user → login attempt fails / existing session invalidated |
| 6 | Messaging Roundtrip | `messaging-roundtrip.spec.ts` | Recruiter sends message → user sees it without manual refresh (real Pusher test app) |
| 7 | AI Resume Enhance | `ai-resume-enhance.spec.ts` | Trigger AI enhance with stubbed provider → suggestions render → apply one → resume field updates |
| 8 | CSV Export | `csv-export.spec.ts` | Click export → file exists → parse and spot-check header + row count matches filtered list |
| 9 | Security: Cross-Role Access | `cross-role-access.spec.ts` | User role cannot access /admin/* (redirected to /unauthorized); recruiter cannot access other company's data; banned user redirected to login on any protected route |
| 10 | Security: IDOR Deep Links | `idor-deep-links.spec.ts` | Direct URL to another user's application returns 404; direct URL to another recruiter's job management returns 404; resume URL of another user returns 404 |

---

## Phase 7 — Performance & Stability

### Query Performance

| # | Scenario | Assertions |
|---|---|---|
| PF1 | Analytics with large date range (5 years) | Query completes within 5 seconds |
| PF2 | Applicant list with 10K+ records | Pagination returns within 500ms; count query uses index |
| PF3 | CSV export with 50K rows | Completes within 30 seconds; memory usage stays under 512MB; streaming does not buffer entire dataset in memory |
| PF4 | Job listing with 100K active jobs | Full-text search returns within 1 second (indexed) |
| PF5 | Concurrent AI enhancement requests | Rate limit rejects all but 5 per user per day; concurrent requests do not double-count |

### Rate Limiter Behavioral Tests

| # | Scenario | Assertions |
|---|---|---|
| RL1 | In-memory reset on restart | Rate limiter is in-memory only — restart resets all counters (document gap; upgrade path to Redis documented) |
| RL2 | Rate limiter key isolation | User A hitting rate limit does not affect User B |
| RL3 | Concurrent requests within window | 10 concurrent requests in same millisecond — all count, 11th+ return 429 |
| RL4 | Pruning does not affect active keys | 10-minute cleanup does not remove active rate-limit keys |
| RL5 | Zero-limit config | `max: 0` rejects all requests |

---

## Phase 8 — Coverage & CI

### Coverage Thresholds

- Start: 35% (Phase 0 setup)
- After Phase 1+2: 45%
- After Phase 3+4: 60%
- After Phase 5+6: 70%
- Never lower a threshold once raised — ratchet only

### CI Pipeline

A GitHub Actions workflow (`.github/workflows/test.yml`) runs on every pull request:
- **Unit/Integration job**: PostgreSQL 16 service container, `npm run test:coverage`
- **E2E job**: Playwright with Chromium, `npm run test:e2e` against seeded test database

---

## Security Audit Checklist (Manual)

Before every production deployment, verify manually:

### Authentication & Sessions
- All role-based redirects function correctly (middleware matrix)
- Banned user sessions are immediately invalidated
- Password reset revokes all existing sessions
- Verify-email page is accessible to authenticated users (not redirected)

### Authorization & Data Boundaries
- File upload and download with authorization boundaries for all 4 role combinations
- Recruiter A cannot see Recruiter B's company dashboard, jobs, or applicants
- User A cannot see User B's profile, resume, applications, or messages
- Admin cannot modify super-admin accounts
- Direct URL manipulation (changing path IDs) returns 403/404 not data

### Input & Injection
- SQL metacharacters in analytics filter inputs rejected at Zod level
- Job search special characters sanitized before Prisma full-text search
- File upload type validation works with renamed extensions
- XSS payloads in message content rendered as text, not HTML

### Real-time & External Services
- Real-time messaging across roles (Pusher connectivity)
- Pusher channel isolation — cannot subscribe to unauthorized channels
- AI enhancement rate limiting + graceful fallback works
- Email sending does not fire for banned users

### Data Integrity
- Bulk operations are atomic (mid-operation failure → no partial state)
- Resume snapshot persists after resume soft-deletion
- Concurrent operations do not corrupt state
- Audit trail is complete for every state mutation

### SEO & Public Access
- Sitemap and robots.txt serve correct content
- JSON-LD structured data validates against Google's testing tool
- Public job listing never shows draft/archived/deactivated jobs

---

## Regression Testing

After any schema migration, shared component change, or dependency upgrade, verify:

- Cross-tenant data isolation (recruiter A cannot see recruiter B's data)
- Application status pipeline (all valid transitions, no invalid transitions)
- Resume snapshot integrity (deleted resume still shows in application detail)
- Bookmark toggle idempotency
- Ban enforcement (banned user sessions revoked, new requests rejected)
- Rate limiter key isolation across users and endpoints
- Zod schema validation for all endpoints
- Error response shapes conform to `{ success, message }` contract
