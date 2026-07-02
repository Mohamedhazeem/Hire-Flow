> ⚠️ ARCHIVED
>
> This document has been superseded by the documentation inside the `/docs` directory.
>
> Source of truth:
>
> - `docs/architecture/technical-design.md`
> - `docs/specs/hire-flow-requirements.md`
> - `docs/implementation/implementation-tasks.md`
> - `docs/testing/testing-strategy.md`

# Hire Flow Next — Test Suite Build Plan

> Zero tests currently exist. This document is chunked into phases. Implement one phase at a time, Verify each phase (commands given per step) before pasting the next. Do not paste multiple phases in one message — context window + review quality both degrade.

---

## Stack Decision (locked — do not deviate)

| Concern                 | Choice                                                                                  | Why                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Unit/Integration runner | **Vitest**                                                                              | Native ESM/TS, fast, works cleanly with React 19 + Next 16, no Babel config hell like Jest                                 |
| Component testing       | **@testing-library/react** + `jest-dom` matchers                                        | Standard, works inside Vitest via `jsdom` env                                                                              |
| API route testing       | Vitest, call route handlers **directly** (`import { POST } from "@/app/api/.../route"`) | App Router handlers are plain functions — no server needed, no supertest                                                   |
| DB integration          | Real Postgres test DB (Docker) + Prisma, truncate between tests                         | Mocking Prisma hides real constraint/transaction bugs — this app relies heavily on `$transaction`, unique constraints, OCC |
| External services       | `vi.mock()` for Pusher SDK, AI client, Resend                                           | These are Node SDKs, not fetch-based — module mocking is simpler and more reliable than network interception               |
| E2E                     | **Playwright**                                                                          | Multi-role auth via `storageState`, real browser, handles Better Auth cookies, file upload, realtime UI                    |
| Coverage                | `@vitest/coverage-v8`                                                                   | Built-in, no extra config                                                                                                  |

**New devDependencies to install (Phase 0):**

```bash
npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @vitest/coverage-v8 @faker-js/faker @playwright/test
npx playwright install --with-deps chromium
```

---

## Phase 0 — Test Infrastructure

**Reuse (do not recreate):** `lib/api-error.ts`, `lib/api-response.ts`, `prisma/schema.prisma`, existing `.env` shape.

### Step 0.0 — `vitest.config.ts` (project root)

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    environmentMatchGlobs: [["**/*.dom.test.{ts,tsx}", "jsdom"]],
    globals: true,
    setupFiles: ["./lib/test/vitest.setup.ts"],
    globalSetup: ["./lib/test/global-setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/*.e2e.test.ts", "node_modules", ".next", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["**/*.config.*", "prisma/**", ".next/**", "e2e/**", "lib/test/**"],
      thresholds: { lines: 35, functions: 35, branches: 30, statements: 35 },
    },
  },
});
```

Rule: component test files end in `.dom.test.tsx` (gets jsdom env). Everything else (`*.test.ts`) runs in `node` env — this covers pure logic and API route tests without paying jsdom overhead.

### Step 0.1 — Test database (local Postgres, no Docker)

Create a dedicated local database using your existing Postgres install:

```bash
createdb hireflow_test
# or, from psql:
psql -U postgres -c "CREATE DATABASE hireflow_test;"
```

Add to `.env.test`:

```
DATABASE_URL_TEST="postgresql://<local_user>:<local_password>@localhost:5432/hireflow_test"
```

Adjust user/password/port to match your local Postgres instance (default port 5432)

### Step 0.2 — `lib/test/global-setup.ts`

```ts
import { execSync } from "node:child_process";
import dotenv from "dotenv";

export async function setup() {
  dotenv.config({ path: ".env.test" });
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}
```

### Step 0.3 — `lib/test/test-db.ts` (isolated Prisma client, never import `lib/prisma.ts` in tests)

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_TEST! });
export const testPrisma = new PrismaClient({ adapter });
```

### Step 0.4 — `lib/test/reset-db.ts`

```ts
import { testPrisma } from "./test-db";

const TABLES = [
  "ApplicationStatusChange",
  "Application",
  "Bookmark",
  "ResumeEnhancementLog",
  "Resume",
  "Message",
  "Thread",
  "Notification",
  "Job",
  "CompanyTeamInvite",
  "Company",
  "AdminInvite",
  "Session",
  "Account",
  "Verification",
  "UserProfile",
  "User",
];

export async function resetDb() {
  for (const t of TABLES) {
    await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`);
  }
}
```

Call `resetDb()` in `beforeEach` of every integration test file.

### Step 0.5 — `lib/test/factories.ts`

```ts
import { faker } from "@faker-js/faker";
import { testPrisma } from "./test-db";

export async function createTestUser(
  overrides: Partial<{ role: "user" | "recruiter" | "admin"; email: string }> = {},
) {
  return testPrisma.user.create({
    data: {
      email: overrides.email ?? faker.internet.email(),
      name: faker.person.fullName(),
      role: overrides.role ?? "user",
      emailVerified: true,
    },
  });
}

export async function createTestCompany(recruiterId: string, overrides = {}) {
  return testPrisma.company.create({
    data: { name: faker.company.name(), ownerId: recruiterId, ...overrides },
  });
}

export async function createTestJob(
  companyId: string,
  overrides: Partial<{ status: string; isActive: boolean }> = {},
) {
  return testPrisma.job.create({
    data: {
      companyId,
      title: faker.person.jobTitle(),
      status: overrides.status ?? "active",
      isActive: overrides.isActive ?? true,
      description: faker.lorem.paragraphs(2),
      ...overrides,
    },
  });
}

export async function createTestApplication(userId: string, jobId: string, overrides = {}) {
  return testPrisma.application.create({
    data: { userId, jobId, status: "applied", ...overrides },
  });
}
```

Extend with `createTestResume`, `createTestThread` as Phase 2 needs them — add on demand, don't front-load unused factories.

### Step 0.6 — `lib/test/auth-fixtures.ts`

```ts
export function mockSession(
  role: "admin" | "recruiter" | "user",
  overrides: Record<string, unknown> = {},
) {
  return {
    user: { id: `test-${role}-id`, email: `${role}@test.dev`, role, ...overrides },
    session: { id: "test-session-id" },
  };
}
```

Per test file: `vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }))`, then in each test: `vi.mocked(auth.api.getSession).mockResolvedValue(mockSession("recruiter"))`.

### Step 0.7 — External service mocks — `lib/test/mocks.ts`

```ts
import { vi } from "vitest";

export function mockPusherTrigger() {
  vi.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: vi.fn().mockResolvedValue(undefined) },
  }));
}

export function mockAiClient(response: unknown) {
  vi.mock("@/lib/ai-client", () => ({ callAI: vi.fn().mockResolvedValue(response) }));
}

export function mockResend() {
  vi.mock("resend", () => ({
    Resend: vi.fn(() => ({ emails: { send: vi.fn().mockResolvedValue({ id: "test" }) } })),
  }));
}
```

### Step 0.8 — `package.json` scripts (add, don't remove existing)

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

**Verification:**

```bash
createdb hireflow_test   # skip if already created
npm run test -- --run lib/test  # should report "no test files" cleanly, not error
```

---

## Phase 1 — Unit Tests: Pure Logic (no DB, no network, highest ROI first)

Target `node` environment, `*.test.ts` colocated next to source file.

| Source file                                                                                                                                                                                                            | Test file                           | Cases to cover                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lib/rate-limiter.ts`                                                                                                                                                                                                  | `lib/rate-limiter.test.ts`          | Allows under limit, blocks at limit, resets after window, isolates by key, cleanup timer doesn't leak across keys                                                                    |
| `app/features/recruiter/libs/csv-builder.ts`                                                                                                                                                                           | `...csv-builder.test.ts`            | Escapes commas/quotes/newlines per RFC 4180, BOM prefix present, empty dataset produces header-only CSV                                                                              |
| `lib/pagination.ts`                                                                                                                                                                                                    | `lib/pagination.test.ts`            | Offset math at page 1/N, cursor encode/decode round-trip, negative/zero page guards                                                                                                  |
| `lib/api-response.ts` + `lib/api-error.ts`                                                                                                                                                                             | `lib/api-error.test.ts`             | Each custom error class maps to correct HTTP status via `api-wrapper`                                                                                                                |
| `lib/routes.ts`                                                                                                                                                                                                        | `lib/routes.test.ts`                | `isHiddenRoute` true/false matrix across `PUBLIC_CONTENT_PATHS`, `PROTECTED_ROUTES`, `AUTH_PAGES`                                                                                    |
| `lib/job-categories.ts`                                                                                                                                                                                                | `lib/job-categories.test.ts`        | Category → filter mapping completeness                                                                                                                                               |
| `app/features/recruiter/libs/rate-limit-message.ts`                                                                                                                                                                    | `...rate-limit-message.test.ts`     | 20/hr boundary, per-pair isolation                                                                                                                                                   |
| `lib/ai-client.ts`                                                                                                                                                                                                     | `lib/ai-client.test.ts`             | Provider selection via `AI_PROVIDER` env, returns `null` gracefully when key missing (mock `fetch`, don't hit real API)                                                              |
| **All Zod schemas** (`profile.schema.ts`, `resume.schema.ts`, `resume-ai.schema.ts`, `application-submit.schema.ts`, `job.schema.ts`, `admin.schema.ts`, `company.schema.ts`, `team.schema.ts`, `analytics.schema.ts`) | `[schema-name].test.ts` beside each | For each: 1 valid payload passes, 3–5 invalid payloads fail with expected `.issues[].path` — cover the actual caps (skills ≤50, experiences ≤20, socialLinks ≤10, coverLetter ≤5000) |

**Verification per file:** `npx vitest run <path> --coverage`. Do not proceed to next table row until green.

---

## Phase 2 — Integration Tests: API Routes + Real Test DB

Test DB (`resetDb()` in `beforeEach`), mocked auth session, mocked Pusher/AI/Resend. Call route handlers directly:

```ts
import { POST } from "@/app/api/jobs/[id]/apply/route";
const req = new Request("http://localhost/api/jobs/x/apply", {
  method: "POST",
  body: JSON.stringify({ resumeId }),
});
const res = await POST(req, { params: Promise.resolve({ id: jobId }) });
expect(res.status).toBe(201);
```

Priority order — build top to bottom, each is a separate Kilo Code chunk:

| #   | Route(s)                                                                                       | Risk if broken                             | Key assertions                                                                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `require-admin.ts`, tenant-scoped recruiter queries                                            | Cross-tenant data leak                     | Recruiter A cannot fetch/mutate Company B's jobs/applicants (expect 403/404, not empty array)                                                                                                                                         |
| 2   | `app/features/jobs/queries/public-job-queries.ts`                                              | Leaked archived/deactivated jobs to public | Job with `status:"draft"` OR `isActive:false` never appears in `listPublicJobs` results, even if the other flag is true                                                                                                               |
| 3   | `app/api/jobs/[id]/apply/route.ts`                                                             | Bad applications, no audit trail           | Duplicate apply blocked, 11th request/min in loop returns 429, `resumeSnapshotUrl`/`resumeSnapshotBuilderData` frozen correctly, first `ApplicationStatusChange` row created with `fromStatus: null`, `triggerForCompany` called once |
| 4   | `app/api/recruiter/applications/[applicationId]/status/route.ts` + `bulk/status/route.ts`      | Corrupted pipeline state                   | Valid transition succeeds + writes audit row + notification; invalid transition (e.g. `hired` → `applied`) rejected; bulk transition is atomic — inject a mid-batch failure and assert **zero** rows changed                          |
| 5   | `.../revert/route.ts`                                                                          | Silent data loss                           | Reverts to prior status from audit trail, not hardcoded default; creates its own audit + notification row (this was previously a missing-notification bug per MANIFEST — regression-guard it)                                         |
| 6   | `app/api/user/resumes/route.ts` + `[id]/route.ts`                                              | Cap bypass, data loss                      | 6th resume upload rejected (5-resume cap), soft-delete sets `deletedAt` but preserves file row, set-primary via `$transaction` leaves exactly one primary                                                                             |
| 7   | `app/api/user/resumes/[id]/ai-enhance/route.ts`                                                | Cost overrun, silent AI failure            | 6th call same day returns 429 (mock `ResumeEnhancementLog` count), missing API key → graceful `null`/fallback response not a 500, suggestions never auto-applied (separate `apply-ai-suggestions` action required)                    |
| 8   | `app/api/recruiter/messages/[threadId]/route.ts`, `app/api/admin/messages/[threadId]/route.ts` | Rate-limit + notification regressions      | 21st message/hr to same pair → 429, Pusher `trigger` called with `private-thread-{id}` channel, `createNotification` called exactly once                                                                                              |
| 9   | `app/api/user/bookmarks/route.ts`                                                              | Duplicate/broken toggle                    | POST twice on same job toggles create→delete, respects `@@unique([userId, jobId])`                                                                                                                                                    |
| 10  | `.../applicants/export/route.ts`                                                               | Wrong/leaked export data                   | CSV respects active filters, excludes other companies' applicants, streaming doesn't truncate above cap (test with injected small cap constant)                                                                                       |
| 11  | `app/api/admin/users/[id]/ban/route.ts` + `sessions/route.ts`                                  | Banned user retains access                 | Ban sets flag + revokes all sessions; banned user's subsequent authenticated request is rejected                                                                                                                                      |
| 12  | `app/api/user/applications/[id]/route.ts` (withdraw)                                           | Withdraw after interview scheduled         | Withdraw allowed only when status is `applied`/`reviewing`, gate rejects otherwise                                                                                                                                                    |
| 13  | `app/api/files/download/route.ts`                                                              | Resume leak                                | Owner ✅, recruiter with an active relationship to that applicant ✅, unrelated recruiter ❌ (403), admin ✅                                                                                                                          |

**Verification per row:** `npm run test -- app/api/<path>.test.ts` green, plus manually confirm `resetDb()` actually ran (row counts back to zero) by adding a temporary `console.log` once, then removing it.

---

## Phase 3 — Component Tests (RTL, `*.dom.test.tsx`)

Focus on components with real logic, not pure presentation.

| Component                                                  | What to test                                                                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/ui/data-table.tsx`                             | Selection state via `selectedIds`/`onSelectionChange`, `disabledIds` rows are unclickable, `getRowId` used correctly for keys                                       |
| `app/features/recruiter/components/applicants-table.tsx`   | Bulk action bar appears only when selection non-empty; available bulk actions are the **intersection** of valid transitions across all selected rows, not the union |
| `app/features/recruiter/components/bulk-reject-dialog.tsx` | Requires reason before submit enabled, calls mutation with all selected IDs                                                                                         |
| `components/shared/status-timeline.tsx`                    | Renders correct order from an `ApplicationStatusChange[]` fixture, handles single-entry (just-applied) case                                                         |
| `app/features/user/components/resume-builder-form.tsx`     | `useFieldArray` add/remove for educations and experiences, skills tag input dedupes                                                                                 |
| `app/features/user/components/ai-suggestions-panel.tsx`    | Per-item "Apply" only mutates that one field, "Copy" writes to clipboard (mock `navigator.clipboard`)                                                               |
| `app/features/jobs/components/job-search-bar.tsx`          | Debounce fires once after typing stops (use fake timers), URL query params sync                                                                                     |
| `app/features/user/components/save-job-button.tsx`         | Anonymous click redirects to login with return URL, authenticated click toggles bookmark                                                                            |
| `app/features/public/components/account-popover.tsx`       | Renders correct menu items per role, no "Dashboard" entry for `user` role                                                                                           |
| `app/features/jobs/components/apply-modal.tsx`             | Submit disabled with no resume selected, shows validation error on cover letter >5000 chars                                                                         |

**Verification per file:** `npm run test -- <path>.dom.test.tsx --coverage`.

---

## Phase 4 — E2E (Playwright, real browser, real Better Auth cookies)

### Setup

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    { name: "anonymous", use: devices["Desktop Chrome"] },
    {
      name: "user",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "recruiter",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/recruiter.json" },
      dependencies: ["setup"],
    },
    {
      name: "admin",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/admin.json" },
      dependencies: ["setup"],
    },
  ],
});
```

`e2e/global.setup.ts` logs in each seeded role via the real UI login form and saves `storageState` to `playwright/.auth/{role}.json`. Seed fixed test accounts for this in `prisma/seed.ts` (or a dedicated `prisma/seed-e2e.ts`) — do not reuse production seed data.

### Journeys (one spec file each, run against `user`/`recruiter`/`admin`/`anonymous` projects as appropriate)

| #   | Journey                                | Assertions                                                                                                                                                                                               |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `e2e/anonymous-apply-redirect.spec.ts` | Browse `/jobs` → open detail → "Log in to Apply" → redirected to `/login` with return path preserved                                                                                                     |
| 2   | `e2e/user-apply-flow.spec.ts`          | Complete profile → build resume → apply to a job → appears in `/user/applications` with `applied` status                                                                                                 |
| 3   | `e2e/recruiter-pipeline.spec.ts`       | Create job → applicant appears → move through pipeline stages → status change reflected on user's application detail page (poll or check after reload)                                                   |
| 4   | `e2e/recruiter-bulk-reject.spec.ts`    | Select 3 applicants → bulk reject with reason → all 3 show `rejected` + audit entries                                                                                                                    |
| 5   | `e2e/admin-ban-user.spec.ts`           | Ban a user → attempt login as that user fails / existing session invalidated                                                                                                                             |
| 6   | `e2e/messaging-roundtrip.spec.ts`      | Recruiter sends message → user sees it without manual refresh (Pusher live) — use a real Pusher test app/cluster for this one, not a mock, since it's testing the realtime wiring itself                 |
| 7   | `e2e/ai-resume-enhance.spec.ts`        | Trigger AI enhance with a stubbed `AI_PROVIDER` route (env-level test double or intercept the outbound HTTPS call via Playwright's `page.route`) → suggestions render → apply one → resume field updates |
| 8   | `e2e/csv-export.spec.ts`               | Click export → downloaded file exists → parse and spot-check header row + row count matches filtered list on screen                                                                                      |

**Verification:** `npm run test:e2e -- --project=user e2e/user-apply-flow.spec.ts` etc., one journey at a time.

---

## Phase 5 — Coverage Gate & CI

### Raise thresholds incrementally

Start at `35%` (Phase 0 config). After Phase 1+2 land, bump to `60%`. After Phase 3, bump to `70%`. Never lower a threshold once raised — ratchet only.

### `.github/workflows/test.yml`

```yaml
name: test
on: [pull_request]
jobs:
  unit-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_USER: test, POSTGRES_PASSWORD: test, POSTGRES_DB: hireflow_test }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test:coverage
        env:
          DATABASE_URL_TEST: postgresql://test:test@localhost:5432/hireflow_test
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.E2E_DATABASE_URL }}
```

---

## Execution Order Summary (paste into Kilo Code in this sequence)

1. Phase 0 (all steps in one prompt — it's scaffolding, not app logic)
2. Phase 1, one table row at a time, or grouped in batches of 3–4 similar files (e.g. all Zod schemas together)
3. Phase 2, **strictly one numbered row per prompt** — these touch real DB state and auth mocking, highest chance of agent error if batched
4. Phase 3, grouped 2–3 components per prompt
5. Phase 4, one journey per prompt
6. Phase 5 last, after coverage numbers are real

Track progress the same way `MANIFEST.md` tracks build phases — add a `TEST-MANIFEST.md` with the same checklist structure if you want persistent memory across agent sessions.
