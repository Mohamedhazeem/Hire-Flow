# Testing Strategy

## Overview

The application currently has zero automated tests. This strategy defines the testing approach, stack, and test plans to be implemented incrementally across phases. Tests are prioritized by risk — critical data integrity and authorization paths are tested first.

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

## Phase 1 — Unit Tests: Pure Logic

Focus on pure functions with no database or network dependencies. Test files colocated next to source files.

### Test Inventory

| Source File | Test File | Cases |
|---|---|---|
| `lib/rate-limiter.ts` | `lib/rate-limiter.test.ts` | Allows under limit, blocks at limit, resets after window, isolates by key, cleanup timer |
| `app/features/recruiter/libs/csv-builder.ts` | `csv-builder.test.ts` | RFC 4180 escaping (commas, quotes, newlines), BOM prefix, empty dataset → header-only |
| `lib/pagination.ts` | `lib/pagination.test.ts` | Offset math at page 1/N, cursor encode/decode round-trip, negative/zero page guards |
| `lib/api-error.ts` + `lib/api-response.ts` | `lib/api-error.test.ts` | Each error class maps to correct HTTP status via api-wrapper |
| `lib/routes.ts` | `lib/routes.test.ts` | `isHiddenRoute` true/false matrix across all route categories |
| `lib/job-categories.ts` | `lib/job-categories.test.ts` | Category → filter mapping completeness |
| `app/features/recruiter/libs/rate-limit-message.ts` | `rate-limit-message.test.ts` | 20/hr boundary, per-pair isolation |
| `lib/ai-client.ts` | `lib/ai-client.test.ts` | Provider selection via `AI_PROVIDER` env, returns null when key missing |

### Zod Schema Tests

For each schema file, test:
- 1 valid payload passes
- 3-5 invalid payloads fail with expected `.issues[].path`
- Edge cases for caps: skills ≤50, experiences ≤20, socialLinks ≤10, coverLetter ≤5000

Schemas to test: `profile.schema.ts`, `resume.schema.ts`, `resume-ai.schema.ts`, `application-submit.schema.ts`, `job.schema.ts`, `admin.schema.ts`, `company.schema.ts`, `team.schema.ts`, `analytics.schema.ts`

### Additional Unit Tests (Post-Implementation Additions)

| Source File | Test File | Cases |
|---|---|---|
| `app/features/shared/api/require-role.ts` | `require-role.test.ts` | Returns session for allowed roles; throws UnauthorizedError when no session; throws ForbiddenError for disallowed roles; resolves companyId/memberRole for recruiters on allowed team |
| `lib/validator.ts` | `lib/validator.test.ts` | Returns success + typed data for valid Zod input; returns failure + flattened errors for invalid input |
| `features/messages/stores/presence-store.ts` | `presence-store.test.ts` | Set/clear user presence; subscribe to thread presence changes; presence persists across store resets; disconnected users removed |
| `app/features/recruiter/components/applicant-table-utils.ts` | `applicant-table-utils.test.ts` | Status transition intersection logic returns correct common transitions; empty selection returns empty set; single-identity edge cases |
| `features/recruiter/components/applicant-table-constants.ts` | (covered by utils test) | — |
| `lib/ai-client.ts` (expanded) | `lib/ai-client.test.ts` | All 3 providers return expected response shape; each provider's error response throws ApiError(502); missing API key for each specific provider returns null; unexpected provider env var falls back to null |
| `components/chat/chat-input-area.tsx` | `chat-input-area.test.ts` | Submit button disabled when input empty; Enter sends message; Shift+Enter inserts newline; file attachment button present; max char limit enforced |
| `components/chat/message-bubble.tsx` | `message-bubble.test.ts` | Renders text content; renders file attachment link; own messages right-aligned with different style; timestamps formatted correctly; deleted message placeholder |
| `components/chat/shared-thread-view.tsx` | `shared-thread-view.test.ts` | Renders header with participant info; renders message list; scrolls to bottom on new message; loading skeleton state; error state with retry |

---

## Phase 2 — Integration Tests: API Routes + Real Test DB

Route handlers called directly with `new Request()`. Real test database with `resetDb()` in `beforeEach`. Mocked auth session, Pusher/AI/Resend.

### Priority Order (by risk)

| # | Route(s) | Risk If Broken | Key Assertions |
|---|---|---|---|
| 1 | `require-admin.ts`, tenant-scoped recruiter queries | Cross-tenant data leak | Recruiter A cannot fetch/mutate Company B's jobs/applicants (expect 403/404, not empty array) |
| 2 | `public-job-queries.ts` | Leaked archived/deactivated jobs | Job with status:"draft" OR isActive:false never appears in public results, even with other flag true |
| 3 | `apply/route.ts` | Bad applications, no audit trail | Duplicate apply blocked, 11th request/min → 429, resume snapshot frozen correctly, first ApplicationStatusChange created with fromStatus: null |
| 4 | `status/route.ts` + `bulk/status/route.ts` | Corrupted pipeline state | Valid transition succeeds + audit + notification; invalid transition (hired→applied) rejected; bulk is atomic (mid-batch failure → zero rows changed) |
| 5 | `revert/route.ts` | Silent data loss | Reverts to prior status from audit trail, not hardcoded; creates audit + notification row |
| 6 | `resumes/route.ts` + `[id]/route.ts` | Cap bypass, data loss | 6th resume upload rejected, soft-delete sets deletedAt preserving file, set-primary leaves exactly one primary |
| 7 | `ai-enhance/route.ts` | Cost overrun, silent AI failure | 6th call same day → 429, missing API key → graceful null fallback (not 500), suggestions never auto-applied |
| 8 | `messages/[threadId]/route.ts` (recruiter + admin) | Rate-limit + notification regressions | 21st message/hr → 429, Pusher trigger called with correct channel, createNotification called exactly once |
| 9 | `bookmarks/route.ts` | Duplicate/broken toggle | POST twice on same job toggles create→delete, respects @@unique constraint |
| 10 | `export/route.ts` | Wrong/leaked export data | CSV respects active filters, excludes other companies' applicants, streaming doesn't truncate above cap |
| 11 | `ban/route.ts` + `sessions/route.ts` | Banned user retains access | Ban sets flag + revokes all sessions; subsequent authenticated request rejected |
| 12 | `applications/[id]/route.ts` (withdraw) | Withdraw after interview scheduled | Withdraw allowed only when applied/reviewing; gate rejects otherwise |
| 13 | `files/download/route.ts` | Resume leak | Owner ✅, related recruiter ✅, unrelated recruiter ❌ (403), admin ✅ |
| 14 | `ai-client.ts` (all 3 providers) | Multi-provider API fails silently | Anthropic, OpenAI, and Google provider each called; invalid API key returns ApiError(502) not generic 500; timeout behavior |
| 15 | `resumes/[id]/ai-enhance/route.ts` (DB rate limit) | Cost overrun across server restarts | DB-backed 5/day limit persists across simulated server instances (create 5 logs, restart, attempt 6th → 429); ResumeEnhancementLog correctly scoped by userId |
| 16 | `notifications/route.ts` | Missing post-implementation fields | Returns notifications with correct type discriminator; data JSON parsed correctly; pagination respects cursor; side-effect free GET |
| 17 | `require-role.ts` (direct invocation) | Guard logic regressions | Super_admin passes admin checks; user fails recruiter check with 403 not 401; recruiter without company membership throws 403 not resolves session |

---

## Phase 3 — Component Tests (RTL)

Focus on components with real logic, not pure presentation.

| Component | Test Cases |
|---|---|
| `components/ui/data-table.tsx` | Selection state via selectedIds/onSelectionChange, disabledIds rows unclickable, getRowId used correctly |
| `applicants-table.tsx` | Bulk action bar appears only when selection non-empty; available bulk actions are the intersection of valid transitions across all selected rows |
| `bulk-reject-dialog.tsx` | Requires reason before submit enabled, calls mutation with all selected IDs |
| `status-timeline.tsx` | Renders correct order from ApplicationStatusChange[] fixture, handles single-entry case |
| `resume-builder-form.tsx` | useFieldArray add/remove for educations and experiences, skills tag input dedupes |
| `ai-suggestions-panel.tsx` | Per-item "Apply" only mutates that one field, "Copy" writes to clipboard (mock navigator.clipboard) |
| `job-search-bar.tsx` | Debounce fires once after typing stops (fake timers), URL query params sync |
| `save-job-button.tsx` | Anonymous click redirects to login with return URL, authenticated click toggles bookmark |
| `account-popover.tsx` | Renders correct menu items per role, no "Dashboard" entry for user role |
| `apply-modal.tsx` | Submit disabled with no resume selected, validation error on cover letter >5000 chars |
| `components/chat/chat-input-area.tsx` | Input empty → submit disabled; Enter sends; Shift+Enter inserts newline; file attach button present |
| `components/chat/message-bubble.tsx` | Renders text; renders file link; own messages right-aligned; timestamp formatting |
| `components/chat/shared-thread-view.tsx` | Header with participant; message list; scroll-to-bottom on new message; loading skeleton; error+retry |
| `components/chat/thread-list-item.tsx` | Unread badge shown; active state highlighted; last message preview truncated |
| `components/chat/chat-header.tsx` | Participant name/avatar; status indicator; back button on mobile |
| `features/recruiter/components/no-company-prompt.tsx` | Renders CTA to create company; link navigates to /recruiter/company |

---

## Phase 4 — End-to-End Tests (Playwright)

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

---

## Phase 5 — Coverage & CI

### Coverage Thresholds

- Start: 35% (Phase 0 setup)
- After Phase 1+2: 60%
- After Phase 3: 70%
- Never lower a threshold once raised — ratchet only

### CI Pipeline

A GitHub Actions workflow (`.github/workflows/test.yml`) runs on every pull request:
- **Unit/Integration job**: PostgreSQL 16 service container, `npm run test:coverage`
- **E2E job**: Playwright with Chromium, `npm run test:e2e` against seeded test database

---

## Manual Testing

### Pre-Launch Checklist

The following should be manually verified before each production deployment:

- All role-based redirects function correctly (middleware)
- File upload and download with authorization boundaries
- Real-time messaging across roles (Pusher connectivity)
- Bulk operations are atomic (mid-operation failure → no partial state)
- AI enhancement rate limiting and graceful fallback
- CSV export respects filters and tenant boundaries
- Sitemap and robots.txt serve correct content
- JSON-LD structured data validates against Google's testing tool

### Regression Testing

After any schema migration or shared component change, verify:

- Cross-tenant data isolation (recruiter A cannot see recruiter B's data)
- Application status pipeline (all valid transitions, no invalid transitions)
- Resume snapshot integrity (deleted resume still shows in application detail)
- Bookmark toggle idempotency
- Ban enforcement (banned user sessions revoked, new requests rejected)
