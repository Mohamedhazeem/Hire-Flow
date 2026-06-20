#### Step 0.8: Test Infrastructure & Smoke Tests (Optional Early Setup)

**Prompt to Agent:**

**Objective:** Set up a lightweight test harness so that if you choose to write tests alongside features, the environment is ready.

**Actionable Tasks:**

1. Install test dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vitest-environment-jsdom msw
   ```

2. Create vitest.config.ts at the project root:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@': '/app',
    },
  },
});
```
3. Create vitest.setup.ts:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```
4. Add a test database environment variable in .env.test:

```text
DATABASE_URL="postgresql://...?schema=test"
And update package.json:
```
```json
"scripts": {
  "test": "vitest",
  "test:ci": "vitest run"
}
```
5. Write a **single smoke test** to verify the setup works:

Create __tests__/middleware.test.ts that mocks next/navigation and checks that an unauthenticated request to /admin redirects to /login.

6. **Stop here**. This is purely infrastructural. No further tests are required until after Phase 5 (or you can write them incrementally on your own).

---

## Artifact B: Post‑Phase 5 Comprehensive Test Prompt

# Post‑Phase 5: Full Test Suite Generation

**Prompt to Agent:**

**Objective:** Now that the entire hire-flow-next platform is complete, build a comprehensive, production‑grade test suite covering unit, integration, and end‑to‑end tests.

**Prerequisites:** All phases (0–5) are complete. The test harness from Step 0.8 is already in place (Vitest + React Testing Library + MSW). Add Playwright for E2E.

---

### 1. Dependencies & Configuration

- Install Playwright: `npm init playwright@latest`
- Install MSW for API mocking in browser tests: `npm install -D msw`
- Create `playwright.config.ts` with baseURL set to `http://localhost:3000`.
- Add a `prisma/seed-test.ts` script that populates a clean test database with:
  - 1 admin (email: `admin@test.com`)
  - 2 recruiters (with companies)
  - 3 users (with profiles)
  - 5 jobs (spread across recruiters)
  - 10 applications (spread across users/jobs)
- Set `NODE_ENV=test` and `DATABASE_URL` to your test DB in `.env.test`.

---

### 2. Unit Tests (Server Actions & Helpers)

Write unit tests (Vitest) for every **Server Action** and **utility function**:

| File | Test Cases |
| :--- | :--- |
| `features/admin/actions/invite-admin.ts` | – Validates email format.<br>– Creates `AdminInvite` row with UUID.<br>– Throws if invited user already exists. |
| `features/recruiter/actions/create-job.ts` | – Rejects if companyId doesn't belong to recruiter.<br>– Inserts Job with correct fields.<br>– Requires all required fields (title, description, etc.). |
| `features/recruiter/actions/update-job.ts` | – Only allows the owning recruiter to update.<br>– Merges partial updates.<br>– Does not allow setting `isActive` (that's an admin-only field). |
| `features/user/actions/upsert-profile.ts` | – Merges skills array correctly.<br>– Handles empty experiences array.<br>– Preserves socialLinks JSON structure. |
| `lib/pagination.ts` | – `offset` & `cursor` helpers return correct SQL/Prisma shapes.<br>– Handles edge cases (negative page, empty results). |
| `lib/api-response.ts` | – `ok()` returns `{ success: true, data: T }`.<br>– `fail()` returns `{ success: false, error: string }` with correct status codes. |

**Mocking Strategy:** Use `vi.mock('@prisma/client')` and provide a mock `prisma` instance. Do not hit the real database in unit tests.

---

### 3. Integration Tests (REST API Routes)

Test all critical **Next.js Route Handlers** using Vitest's `request` utility (or `supertest` alternative). Use a real test database, **reset it before each suite** (truncate all tables).

| Endpoint | Test Cases |
| :--- | :--- |
| `POST /api/jobs/[id]/apply` | – Successful application creates `Application` row.<br>– Duplicate application returns `409 Conflict`.<br>– Rejects if job is not `isActive`.<br>– Creates a `Notification` for the recruiter. |
| `POST /api/admin/ban` | – Upserts `Ban` record.<br>– Sets `user.isBanned = true`.<br>– Creates a `Notification` for the banned user.<br>– Admin cannot ban themselves. |
| `DELETE /api/admin/ban` | – Removes `Ban` record.<br>– Sets `user.isBanned = false`.<br>– Requires admin session. |
| `PATCH /api/recruiter/applications/[id]/status` | – Updates `Application.status`.<br>– If status is `rejected`, `rejectionReason` is required.<br>– Creates a `Notification` for the applicant.<br>– Only the job's owning recruiter can change status. |
| `POST /api/messages/send` | – Derives correct `threadId` (`smallerId_largerId`).<br>– Enforces authorization: user ↔ only applied recruiters; recruiter ↔ only their applicants.<br>– Persists message.<br>– Triggers Pusher broadcast (mock the Pusher client). |
| `GET /api/messages/[threadId]` | – Returns messages in chronological order.<br>– Marks unread messages as `read: true` for the viewer.<br>– Returns 404 if thread doesn't exist. |

---

### 4. Integration Tests (Server Actions from the UI)

Mock the `auth.api.getSession()` to simulate logged‑in users of different roles. Test that the Server Actions are correctly called from the client forms (using `await act()` and `fireEvent`).

| Flow | Test Case |
| :--- | :--- |
| Recruiter creates a job | Fill form → submit → database has new job → redirect to `/recruiter/jobs`. |
| User updates profile | Add a new experience → submit → database reflects update → page re‑renders with new card. |
| Admin invites a new admin | Submit email → `AdminInvite` row created → UI shows pending invite. |

---

### 5. Component Tests (React Testing Library)

Test all **shared and role‑specific components** in isolation. Mock the `useQuery`/`useMutation` hooks from TanStack Query.

| Component | Test Cases |
| :--- | :--- |
| `navbar.tsx` | – Shows public links when logged out.<br>– Shows `Dashboard` and role‑specific links when logged in.<br>– Clicks on logout call `signOut()`. |
| `apply-button.tsx` | – Disabled if user already applied.<br>– Opens `resume-picker-dialog` on click.<br>– Shows a toast on successful application. |
| `ban-dialog.tsx` | – Submits reason → calls `POST /api/admin/ban`.<br>– Shows loading state while request is pending.<br>– Closes on success. |
| `notification-bell.tsx` | – Displays correct unread badge count.<br>– Click opens popover listing notifications.<br>– Clicking a notification marks it as read and navigates. |
| `status-badge.tsx` | – Renders correct colour for each `ApplicationStatus`.<br>– `rejected` shows a tooltip with rejection reason. |
| `message-composer.tsx` | – Optimistic UI: new message appears instantly in the list.<br>– Shows error toast if `POST` fails.<br>– Clears input after send. |

---

### 6. End‑to‑End Tests (Playwright)

Test the **critical user journeys** across multiple pages and roles. Run against a seeded test database on `localhost:3000`.

| Journey | Steps |
| :--- | :--- |
| **Unregistered user browses jobs** | – Go to `/jobs`.<br>– Type "Remote" in search bar → results update.<br>– Click a job card → view `/jobs/[id]`.<br>– Click "Apply" → redirected to `/login`. |
| **User applies to a job** | – Login as a user (`user@test.com` / `password123`).<br>– Browse `/jobs` → find a job.<br>– Click "Apply" → pick a resume from dialog → confirm.<br>– Navigate to `/user/applications` → status is "applied". |
| **Recruiter processes an application** | – Login as a recruiter (`recruiter@test.com`).<br>– Go to `/recruiter/applicants` for a job.<br>– Find an applicant → change status to "viewed".<br>– Reload page → status persists.<br>– Change status to "rejected" → enter a reason → reason appears. |
| **Admin bans a user** | – Login as admin (`admin@test.com`).<br>– Go to `/admin/users` → search for a user.<br>– Click "Ban" → enter reason → submit.<br>– Try to login as that user → redirected to `/banned`. |
| **User sends a message to recruiter** | – Login as user → go to `/user/messages/[threadId]`.<br>– Type message → click send → appears instantly.<br>– Login as recruiter → go to `/recruiter/messages/[sameThreadId]` → sees the new message. |
| **Real‑time notification** | – As user, have an open tab.<br>– As recruiter, change application status to `accepted`.<br>– User's notification bell increments by 1 without page reload. |

---

### 7. Code Coverage

- Configure Vitest to generate coverage reports:
  ```bash
  npm install -D @vitest/coverage-v8
  ```
- Add --coverage to test script.

- Set a minimum threshold in vitest.config.ts:

```ts
test: {
  coverage: {
    thresholds: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
},
```
### 8. CI / GitHub Actions (Optional but recommended)
Create .github/workflows/test.yml that:

- Runs on push to main and pull_request.

- Sets up Node.js, installs dependencies.

- Starts a PostgreSQL test container.

- Runs Prisma migrations on the test DB.

- Runs npm run test:ci (Vitest) and npm run test:e2e (Playwright).

- Uploads Playwright screenshots on failure.

- Acceptance Criteria: All tests pass; coverage is reported in the terminal; no flaky tests (retry flakes up to 2 times).

---

### How to use these later:

1. Save both blocks in a file called `testing-plans.md` in your root.
2. If you ever decide to write tests **early**, copy **Artifact A** into your agent and run it after Step 0.7.
3. Once your entire platform is live and stable, copy **Artifact B** into your agent and let it generate the full suite.

You're all set. Stick to your roadmap and build that portfolio!