# **CLAUDE OUTPUT REFINE WITH GEMENI**

**### GLOBAL CONTEXT (Add to `.cursorrules` or system prompt)**

**# hire-flow-next Architecture Rules**

**You are an expert Next.js 16+ (App Router) and Prisma developer. Strictly adhere to these rules:**

1. **Mutations & Fetching:**
   - **REST route handlers** (`app/api/...`) are the DEFAULT for all data mutations and fetching (e.g., apply, send message, ban, analytics, delete actions).
   - **Server Actions** (`'use server'`) are strictly reserved for PLAIN FORM SUBMISSIONS ONLY (e.g., create job, update profile, edit company) to save network round-trips.
   - Use **TanStack Query** (`@tanstack/react-query`) for all client-side data fetching, caching, and background updates.
   - Use **Zustand** exclusively for global UI client-state (sidebars, modals, collapse toggles) – never store API data in Zustand.
   - **All data fetching from client components MUST be done via TanStack Query hooks (`useQuery`, `useMutation`). Never use plain `fetch` or `axios` directly inside components.**
   - **API routes remain the same (REST/Server Actions). TanStack Query calls those endpoints.**

2. **Messaging & Notifications:** - Event-Driven WebSockets via Hosted Provider (Pusher) for real-time messaging and notifications.
   - NO interval polling.
   - Use `private-thread-[threadId]` channels for chat (one‑to‑one DMs) and `private-user-[userId]` channels for global notifications. This ensures Better Auth can easily authorise subscriptions.

3. **Route Groups:** - Use `(admin)`, `(recruiter)`, `(user)`, `(auth)`, and public routes.
   - Each protected group must have a layout role guard.

4. **Auth:** - Assume Better Auth is configured at `lib/auth.ts`.
   - Use `auth.api.getSession()` for all server-side auth checks.

5. **Validation & Safety:**
   After any modification to prisma/schema.prisma, you must run npx prisma validate and npx prisma generate.
   After any step that creates or modifies TypeScript files, you must run npm run build or tsc --noEmit to confirm zero type errors.
   **```**

---

**### Phase 0: Foundation**

**#### Step 0.0: Project Initialization & Dependencies**

**Prompt to Agent:**

**Objective:** Initialize required UI libraries and dependencies for the hire-flow-next project.

**Actionable Tasks:**

1. Install **`recharts`, `motion/react`, `lucide-react`, `date-fns`, `@tanstack/react-query`, `zustand`.**

2. Initialize `shadcn-ui` if not already done.

3. Add the following shadcn components via CLI: `button`, `input`, `badge`, `table`, `dialog`, `select`, `popover`, `textarea`.

4. Ensure `tailwind.config.ts` or `globals.css` is configured for standard theme tokens (primary, muted, destructive). Do not use hardcoded hex colors in future components.

---

**#### Step 0.1: Prisma Schema**

**Prompt to Agent:**

**Objective:** Extend the `schema.prisma` with all platform models to avoid relation churn later.

**Actionable Tasks:**

1. Update `prisma/schema.prisma` to include the following models/enums:

Enums: `Role (user, admin, recruiter)`, `WorkMode`, `ApplicationStatus`, `NotificationType`.

Models: Extend existing `User` (add `role` and relations). Add `UserProfile`, `Resume`, `Company`, `Job`, `Application`, `Message`, `Notification`, `AdminInvite`.

2. Ensure `onDelete: Cascade` is applied to related records (e.g., Job deletions delete Applications).

3. Enforce the thread ID convention conceptually: thread IDs will be `[smallerUserId]_[largerUserId]`. Do not create a separate Thread model.

4. Run `npx prisma format`.

5. Run npx prisma validate and npx prisma generate. Fix any errors.

6. Only after validation passes, create the migration: npx prisma migrate dev --name init-platform-models.

---

**#### Step 0.2: Middleware & Route Guards**

**Prompt to Agent:**

**Objective:** Implement role-based routing guards.

**Files to Create/Edit:** `proxy.ts`, `app/(admin)/layout.tsx`, `app/(recruiter)/layout.tsx`, `app/(user)/layout.tsx`.

**Actionable Tasks:**

1. In the middleware, read the session. Define `ROLE_PREFIXES` mapping `/admin` to `admin`, etc.

2. Rules: No session -> redirect `/login`. `isBanned` -> redirect `/banned`. Wrong role -> redirect `/`.

3. In each route group's `layout.tsx`, re-fetch the session server-side for defense-in-depth, and wrap children in a basic `<main className="p-spacing-6">` shell.

---

**#### Step 0.3: Shared UI Primitives**

**Prompt to Agent:**

**Objective:** Build shared UI/API utilities used across all roles.

**Files to Create/Edit:** `lib/api-response.ts`, `lib/pagination.ts`, `components/ui/data-table.tsx`, `components/ui/status-badge.tsx`, `components/layout/page-header.tsx`.

**Actionable Tasks:**

1. Create API helpers `ok<T>(data)` and `fail(message, status)`.

2. Create pagination helpers for offset/cursor math.

3. Build a generic `DataTable` using shadcn `Table`.

4. Build `StatusBadge` mapping `ApplicationStatus` to theme-token colors (no hex codes).

5. Build `PageHeader` (title + action row).

---

**#### Step 0.4: Mock File Upload Provider (Missing Step Added)**

**Prompt to Agent:**

**Objective:** Create a temporary local/mock upload utility so file dependent features (Resumes, Logos) can be built without external API keys.

**Files to Create/Edit:** `lib/upload.ts`, `app/api/upload/route.ts`.

**Actionable Tasks:**

1. Create a `POST /api/upload` REST route that accepts `multipart/form-data`.

2. For now, simulate an upload delay, save the file to a local `/public/uploads` directory, and return the local URL.

3. Add a comment: `// TODO: Swap with S3/Vercel Blob in production`.

---

**#### Step 0.5: Database Seed Script (Missing Step Added)**

**Prompt to Agent:**

**Objective:** Create a seed script to populate testing data.

**Files to Create/Edit:** `prisma/seed.ts`, `package.json`.

**Actionable Tasks:**

1. Write a script that creates 1 Admin, 2 Recruiters (with Companies and 5 Jobs each), and 3 Users (with Profiles and Resumes).

2. Generate a few `Application` records linking the users to the jobs.

3. Add `"seed": "ts-node prisma/seed.ts"` to `package.json`.

---

#### Step 0.6: TanStack Query Provider & Zustand Stores

**Prompt to Agent:**
**Objective:** Set up the global QueryClient, a thin fetch wrapper, and Zustand UI state stores.

**Actionable Tasks:**

1. Create `lib/query-client.ts` that exports a `QueryClient` singleton with default options (`staleTime: 30_000`, `retry: 2`).
2. Wrap the root layout (`app/layout.tsx`) in a `<QueryClientProvider>` from `@tanstack/react-query`.
3. Create a Zustand store `stores/ui-store.ts` with slices for themeStore,`sidebarOpen`, `chatSidebarOpen` and helper actions (`toggleSidebar`, etc.).
4. Create a Zustand store `stores/chat-store.ts` that holds the `activeThreadId` and `unreadCounts` for the global inbox – **never cache API data**.
5. Create `lib/api-client.ts` – a thin wrapper around the global `fetch`:
   - Automatically prepends `process.env.NEXT_PUBLIC_APP_URL` as the base URL.
   - Parses JSON and throws a structured error if `!response.ok`.
   - Exported as a simple `apiClient(path, options)` function.
6. In `lib/query-client.ts`, set the global `defaultQueryFn` to use `apiClient` so all custom hooks automatically use it:
   ```ts
   queryClient.setDefaultOptions({
     queries: {
       queryFn: async ({ queryKey }) => {
         const [path, params] = queryKey as [string, Record<string, unknown>?];
         return apiClient(path, { params });
       },
     },
   });
   ```

---

#### Step 0.7: Project Manifest (Agent Memory)

**Prompt to Agent:**
**Objective:** Use persistent MANIFEST.md file to track progress, built files, and pending work across sessions.

**Actionable Tasks:**

1. Update MANIFEST.md file in the project root.

2. Populate it with the following sections:

   - Last Updated – timestamp.

   - Overview – current phase, current step, next step.

   - Completed Steps – checkboxes for every step across all phases (mark Step 0.0 through 0.7 as [x]).

   - Created File Paths – group by phase (e.g., Phase 0:, Phase 1:), list every new file path generated.

   - Pending Dependencies – any prerequisites that are not yet built.

   - Active Global Context Snapshot – a brief summary of the key architecture rules (so the agent can re‑orient quickly without re‑reading the entire prompt).

   - Known Issues / TODOs – any temporary workarounds or pending refactors.

3. **Instruction for all future sessions:** At the end of every agent session, the agent must update this manifest – mark newly completed steps, append newly created file paths, and update the “next step” pointer.

---

**### Phase 1: Admin**

**#### Step 1.1: Admin API (Queries & Ban Action)**

**Prompt to Agent:**
Objective: Build queries, REST routes, and TanStack Query hooks for Admin people management.

Actionable Tasks:

1. Create `features/admin/queries/list-people.ts` (paginated, filtered by role).
2. Create `POST /api/admin/ban` to ban a user (upsert Ban, set Banned: true, create Notification).
3. Create `DELETE /api/admin/ban` to lift the ban.
4. **Build two TanStack Query hooks:**
   - `features/admin/hooks/use-people.ts` → `useQuery` for the list.
   - `features/admin/hooks/use-ban-mutation.ts` → `useMutation` that calls the ban/unban endpoints and invalidates the `['admin', 'people']` query key on success.

---

**#### Step 1.2: Admin UI (Users & Recruiters)**

**Prompt to Agent:**

**Objective:** Build the management tables for admins.

**Actionable Tasks:**

1. Create `app/(admin)/admin/users/page.tsx` and `app/(admin)/admin/recruiters/page.tsx`.

2. Build `people-table.tsx` wrapping the shared `data-table.tsx`. Includes debounced search.

3. Build `ban-dialog.tsx` that calls the REST routes from Step 1.1. Trigger `router.refresh()` on success.

4. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 1.3: Admin Team Management**

**Prompt to Agent:**

**Objective:** Build the invite flow for new admins.

**Architecture Constraint:** The invite creation is a plain form submission. USE A SERVER ACTION here. The acceptance is a REST route.

**Actionable Tasks:**

1. Create `features/admin/actions/invite-admin.ts` (Server Action). Creates `AdminInvite` with a UUID token.

2. Create `features/admin/components/invite-admin-form.tsx` using RHF + Zod to trigger the action.

3. Create `POST /api/admin/invite/accept` (REST Route). Validates token, sets user role to admin.

4. Create `/admin/team/page.tsx` to display pending invites and the form.

5. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 1.4: Admin Job Oversight & Analytics**

**Prompt to Agent:**

**Objective:** Give admins power to view stats and deactivate jobs platform-wide.

**Architecture Constraint:** Job deactivation is an admin toggle. USE A REST ROUTE (`PATCH`).

**Actionable Tasks:**

1. Create `features/admin/queries/list-all-jobs.ts` and `get-platform-stats.ts`.

2. Create `PATCH /api/admin/jobs/[id]/toggle/route.ts` to flip a job's `isActive` state.

3. Build `/admin/jobs/page.tsx` displaying all jobs with the toggle button.

4. Build `/admin/analytics/page.tsx` using generic stat cards and a `recharts` `growth-chart.tsx`.

---

**#### Step 1.5: Admin Messaging Entry Point**

**Prompt to Agent:**

**Objective:** Build the entry point for admins to DM any user.

**Actionable Tasks:**

1. Create `/admin/messages/page.tsx`. For now, render an empty state placeholder.

2. Build `start-thread-search.tsx` that searches users/recruiters.

3. On select, redirect the admin to `/admin/messages/[smallerId]_[largerId]` (the strict thread ID convention).

---

# Phase 2: Recruiter Portal – Implementation Guide for AI Agent

**Agent Execution Instructions:**
Do not implement this entire document at once. Treat this as the Master Context. Implement the features chunk by chunk (e.g., Step 0 first, wait for review, then Step 2.1, etc.). Before writing code for any step, ensure you have the exact Prisma schema context for the relevant models.

---

## Core Principles & Constraints

- **Reuse over rewrite**: Admin components (tables, forms, charts, uploads, notifications, team management) are extracted to `components/shared/`, `hooks/`, `lib/`, and `features/team/`. Recruiter features import these and apply recruiter-specific data fetching and permission checks.
- **Component Interfaces**: Assume reused UI components like `DataTable` accept standard props (e.g., `{ columns, data, pageCount, searchKey }`). Ensure you pass properly typed data.
- **Error Handling**: All server actions must use `api-error.ts` (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`). Never throw a raw `Error`.
- **Session & Role Validation**: Every server operation must call `await requireRole(['recruiter'])` (or `['recruiter-member']` as needed) at the start.
- **Data Ownership (Tenant Isolation)**: All database queries must include a `where` clause that restricts to the recruiter's company (via `recruiter.companyId`). Never allow cross-company data access.
- **Unified Mutation Paradigm**: Use Next.js Server Actions for all state mutations. Do not mix REST API routes (`/api/...`) with Server Actions unless building a public webhook.
- **Handling Scale & Edge Cases**:
  - **Data Retention**: Never hard-delete active or past jobs. Implement soft-deletes (e.g., updating `status` to `archived`) so application data and history are preserved.
  - **Server-Side Pagination**: All data tables (Jobs, Applicants) must utilize server-side pagination, sorting, and filtering via URL `searchParams`. Do not fetch all records into client memory.
  - **Async Heavy Tasks**: For bulk status updates involving emails, ensure the database transaction completes first. Offload email sending (e.g., via a background queue or returning success early) to prevent serverless function timeouts.
  - **File Security**: Applicant attachments (resumes, portfolios) must be fetched via an authenticated route or signed URL. Do not expose public raw storage URLs.
  - **Rate Limiting**: Implement basic rate limiting (or DB checks) for high-abuse endpoints like Team Invitations and Direct Messaging.

---

## Step 2.0: Recruiter Layout & Sidebar (Foundation)

**Goal**: Create the shell that all recruiter pages share.

**Implementation**:

1. Create `app/recruiter/layout.tsx`:
   - Import the shared `Sidebar` component (extracted from admin to `components/layout/sidebar.tsx`).
   - Pass a `navItems` array:
     ```ts
     const navItems = [
       { href: "/recruiter", label: "Dashboard", icon: DashboardIcon },
       { href: "/recruiter/company", label: "Company Profile", icon: CompanyIcon },
       { href: "/recruiter/team", label: "Team Members", icon: TeamIcon },
       { href: "/recruiter/jobs", label: "Jobs", icon: JobsIcon },
       { href: "/recruiter/analytics", label: "Analytics", icon: AnalyticsIcon },
     ];
     ```
   - Fetch recruiter data (name, email, avatar) and company logo server-side (using `getServerSession` + Prisma) and pass to the sidebar for the profile section.
   - The sidebar should highlight the active route using `usePathname()` client-side.
   - **Profile Section**: Display the recruiter's avatar, name, and company name/logo at the bottom of the sidebar, with a logout button (reuse admin's user menu dropdown).

---

## Step 2.1: Company Profile CRUD

**Goal**: Allow the primary recruiter to set up and edit their company details.

**Data Model**:
`Company`: id, name, description, website, logoUrl, industry, createdAt, updatedAt.

**Implementation**:

- **Page (`app/recruiter/company/page.tsx`)**: Server component that calls a server action `getCompany()` to fetch the company linked to `recruiterId`. If exists, pass as `defaultValues`. If not, show empty form.
- **Form Component (`features/recruiter/components/company-form.tsx`)**:
  - react-hook-form + Zod validation.
  - Fields: name (required), description, website, logoUrl (hidden input), industry.
  - Include file upload UI that returns a URL into the `logoUrl` field (reuse admin upload component).
- **Server Action (`upsert-company.ts`)**:
  - Validate session `requireRole(['recruiter'])`.
  - Validate input with Zod.
  - Upsert Company where `recruiterId = session.user.id`.
  - Revalidate page on success.
- **Hooks**: `useCompany.ts` (fetch) and `useCompanyMutation.ts` (mutate).

---

## Step 2.2: Recruiter Team Management

**Goal**: Let the company admin invite other recruiters/hiring managers to the same company.

**Implementation**:

- **Page (`app/recruiter/team/page.tsx`)**: Fetch current recruiter's role. If not 'admin', show forbidden state. Render `TeamManagement` component (extracted to `features/team/components/team-management.tsx`).
- **TeamManagement Component**: Displays a `DataTable` of current team members. Actions: Remove Member, Change Role, Invite Member.
- **Server Action (`invite-team-member.ts`)**:
  - Validate role `['recruiter']` AND check if role is `'admin'`.
  - **Rate Limit**: Restrict invites to prevent spam.
  - Generate token, create `Invitation` record, send `TeamInviteEmail`.
- **Accept Invite Flow (`app/accept-recruiter-invite/page.tsx`)**: Read/validate token. If logged in, create/update `Recruiter` record and delete invitation. If logged out, redirect to auth, then back.

---

## Step 2.3: Job Posts CRUD (with Job Detail View)

**Goal**: Allow recruiters to create, edit, view, delete (soft/hard), and toggle job posts.

**Data Model**:
`Job`: id, companyId, title, description, requirements (JSON/text), status (ENUM: 'draft' | 'active' | 'archived'), viewCount, createdAt, updatedAt, postedAt.

**Implementation**:

- **Pages**:
  - `/recruiter/jobs` (list view, server-side pagination)
  - `/recruiter/jobs/new` (create form)
  - `/recruiter/jobs/[id]/edit` (edit form)
  - `/recruiter/jobs/[id]` (Job Detail View)
- **Job Form (`components/shared/forms/job-form.tsx`)**: Accepts `defaultValues` and `onSubmit`. Hides `companyId` (set server-side).
- **Server Actions**:
  - `create-job.ts`: Validate session, set `companyId`, create job.
  - `update-job.ts`: Validate ownership. Update job.
  - `delete-job.ts`: Validate ownership. If job is `draft`, hard delete. If `active` or `archived`, **soft delete** by updating status to `archived` to preserve application data. Also add hard delete option.
  - `toggle-job-status.ts`: Toggle status between 'active' and 'archived'/'draft'.
- **Job Detail Page (`/recruiter/jobs/[id]`)**: Show job details. Embed the Applicants Table (filtered by `jobId`) below it.

---

## Step 2.4: Applicants View, Status Pipeline & Selection Workflow

**Goal**: Show applicants for a specific job, allow status changes with custom dialogs.

**Data Model**:
`Application`: id, jobId, userId, status (ENUM: applied, reviewing, shortlisted, interview_scheduled, offered, hired, rejected), rejectionReason, interviewDate, meetingLink, offerDetails, createdAt, updatedAt.

**Implementation**:

- **Page (`/recruiter/jobs/[jobId]/applicants`)**: Server component. **Must use server-side pagination via URL searchParams.**
- **ApplicantsTable (`components/shared/tables/applicants-table.tsx`)**: Columns: Name, Email, Status, Applied Date, Actions (View Application, Status Change Dropdown). Expandable row for `rejectionReason`.
- **Status Pipeline Dialogs**:
  - `ShortlistDialog`: Confirmation.
  - `ScheduleInterviewDialog`: Capture date, time, meeting link, optional message.
  - `SendOfferDialog`: Capture offer details, custom message.
  - `RejectDialog`: Capture rejection reason (required).
  - Include a toggle in each dialog: "Send email notification". or direct messaging
- **Server Action (`update-application-status.ts`)**:
  - Validate ownership: `application.job.companyId === recruiter.companyId`.
  - Validate inputs via Zod based on status.
  - **Concurrency Check**: Verify the `updatedAt` timestamp matches the client's version to prevent race conditions.
  - Trigger in-app notification. If "Send email" is toggled, trigger email.

---

## Step 2.5: Direct Messaging (Thread‑Based)

**Goal:** Recruiters can have threaded, persistent conversations with applicants, reusing the admin chat system’s `Message` model and shared UI components. if any server action is shared logic with admin then use it.

**Data Model:**

- Reuse existing `Message` model: `id`, `threadId` (derived as `[smallerUserId]_[largerUserId]`), `senderId`, `receiverId`, `content`, `fileUrl` (stores `fileId`), `fileName`, `fileSize`, `fileType`, `read`, `createdAt`.

**Shared Utilities:**

- `computeThreadId(userA, userB)` → deterministic thread key.
- `verifyRecruiterApplicantRelationship(recruiterUserId, applicantUserId)` → ensures applicant applied to a job of recruiter’s company; throws `ForbiddenError` otherwise.

**Server Actions** (under `features/recruiter/actions/messages/`):

- `get-threads.ts`- List all conversation threads for the recruiter.Group `Message` by `threadId` where recruiter is sender/receiver, filter to only applicants of company’s jobs. Return `{ success, data: Thread[] }`. -`get-messages.ts` - Cursor‑paginated messages for a thread. Verify relationship, fetch messages (`?cursor=&limit=30`), mark received as read.
  `send-message.ts` Send text / file. Validate input (`content` or `fileId`).
- Rate limit: max 20 messages per recruiter‑applicant per hour. Store `fileId` in `fileUrl` field. Future: publish Pusher event. Return new message. -`delete-thread.ts` Delete entire thread. Ownership check; delete all messages in thread.
- `delete-message.ts`Delete own single message. Own sender check.
- `search-applicants.ts`Search users who applied to company’s jobs. Return `{ id, name, email }[]` based on query.

**Client‑Side Hooks** (`features/recruiter/hooks/messages/`):

- `useRecruiterThreads()` → `useQuery`
- `useRecruiterMessages(threadId)` → `useInfiniteQuery`
- `useSendMessage(threadId)` → `useMutation` (optimistic update)
- `useDeleteMessage(threadId)` / `useDeleteThread()` → `useMutation`

---

## Step 2.6: Applicant Detail View

**Goal**: Full-page view of a single application.

**Implementation**:

- **Page (`/recruiter/applications/[applicationId]`)**: Fetch application data with ownership check.
- **Content**:
  - Applicant info (name, email, phone).
  - **File Security**: Resume/Cover letter links **must** use an authenticated API route (e.g., `/api/files?fileId=...`) or generate a temporary signed URL. Do not use raw public storage URLs.
  - Custom question answers (if applicable).
  - Status Timeline (history of status changes).
  - Communication Log (list of messages) or Chat Icon to open message .
- **Actions**: Shortlist, Schedule Interview, Offer, Reject, Send Message.

---

## Step 2.7: Bulk Actions for Selection

**Goal**: Apply status changes to multiple applicants at once.

**Implementation**:

- **Server Action (`bulk-update-applications.ts`)**:
  - Validate session and ownership for all `applicationIds`.
  - Deduplicate IDs.
  - Perform DB update in a single transaction.
  - **Async Processing**: If emails are triggered, dispatch them to a background queue or edge function. Do NOT await hundreds of emails in the main thread to prevent serverless timeouts.
- **UI**: Add row selection to `ApplicantsTable`. Add "Bulk Actions" dropdown. Prompt for required fields (meeting link, rejection reason) via modals for bulk actions.

---

## Step 2.8: Recruiter Analytics & Filters

**Goal**: Aggregated metrics and filtering capabilities.

**Implementation**:

- **Page (`/recruiter/analytics`)**:
- **Server Action (`get-job-analytics.ts`)**: Calculate total jobs, total applications, average applications per job, conversion rate.
- **UI**: Reuse `stats-cards.tsx` and `growth-chart.tsx`.
- **Filters**: Add filter bars (`job-filter-bar.tsx`, `applicant-filter-bar.tsx`) that update URL `searchParams` for deep linking and server-side filtering.

---

## Step 2.9: Recruiter Dashboard

**Goal**: Default landing page overview.

**Implementation**:

- **Page (`/recruiter/page.tsx`)**:
- **Server Action (`get-dashboard-stats.ts`)**: Returns counts (Total Jobs, Total Applicants, Pending Reviews, New Applications) and Recent Applications (last 5).
- **UI**: Stats cards, Recent Applications Table, Quick Action Buttons ("Create New Job", "Invite Team Member").

---

## Step 2.10: Notifications & Activity Feed

**Goal**: Keep recruiters informed of applicant actions.

**Implementation**:

- **Component**: Notification Bell in the sidebar header.
- **Logic**: Fetch unread count from `Notification` table. Dropdown shows recent events (e.g., "New application for Senior Dev"). Mark as read on click.
- **Triggers**: New applications, status changes, team invitations. Extract logic to `lib/notifications.ts`.

---

## Step 2.11: Export Applicants (CSV)

**Goal**: Download applicant data.

**Implementation**:

- **Action**: "Export CSV" button on `/recruiter/jobs/[jobId]/applicants`.
- **Server Action (`export-applicants-csv.ts`)**:
  - Validate job ownership.
  - Fetch all applications for the job.
  - Generate CSV string. Return as a Base64 string or downloadable blob payload to the client.
  - Use `csv-writer` or `papaparse` for CSV generation.

---

## Phase 3: User

#### Step 3.0a: Infrastructure Audit (Status: Already Built — No Action)

Objective: Confirm Phase 2 spillover already satisfies the original Step 3.0.

Already done, do not rebuild: `app/(roles)/user/layout.tsx`, `user-layout-client.tsx`, `user-sidebar.tsx` (with Messages link), Notification bell wiring, `/user/messages`, `/user/notifications`, recruiter-side messaging entry point.

Remaining gap: `app/(roles)/user/page.tsx` is still the Phase-0 placeholder. Build the real dashboard there (Step 3.0b) — **not** at `/user/dashboard` as the original draft said; follow the recruiter precedent (`app/(roles)/recruiter/page.tsx`, Step 2.9) where the dashboard lives at the role's index route.

Verification: `grep -r "UserSidebar\|messagesBasePath" app/(roles)/user` returns matches with no missing imports.

---

#### Step 3.0b: User Dashboard (Real Implementation)

Objective: Replace the placeholder root page with a real summary view, mirroring `recruiter-dashboard.tsx`.

Reuse: locate and reuse the existing StatCard component used by `app/features/recruiter/components/recruiter-dashboard.tsx` and `app/features/admin/components/admin-dashboard.tsx` (search `components/shared/` and both feature dirs) — do not create a duplicate stat card.

Files to Create/Edit:

- `app/features/user/queries/dashboard-queries.ts`
- `app/features/user/hooks/use-user-dashboard.ts`
- `app/features/user/components/user-dashboard.tsx`
- `app/api/user/dashboard/route.ts`
- `app/(roles)/user/page.tsx` (replace placeholder)

Actionable Tasks:

- `getUserDashboardStats(userId)`: parallel Prisma queries → total applications, applications by status (group by), profile completeness % (computed from `UserProfile` field presence — skills.length>0, workMode set, ≥1 experience, ≥1 resume), recent applications (last 5, include job.title + company.name + status), unread notification count.
- Quick action cards: "Complete Your Profile" (hidden once completeness=100%), "Upload a Resume" (hidden once ≥1 resume exists), "Browse Jobs" (always), each linking to the relevant page.
- Auth: `requireRole(['user'])` inside the route handler.

Verification: visiting `/user/page.tsx` for a new user shows 0 applications + both onboarding quick actions; for a seeded user with applications it shows correct counts and hides completed quick actions.

---

#### Step 3.0c: Schema Migration — Missing Fields

Objective: Add fields required by Steps 3.2–3.3 that the original Phase 0 schema omitted.

Actionable Tasks:

- Inspect current `Resume` model. If absent/incomplete, define:

```prisma
model Resume {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fileUrl     String   // stores fileId, same convention as Message.fileUrl
  fileName    String
  fileSize    Int
  fileType    String
  isPrimary   Boolean  @default(false)
  builderData Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

- Add the missing FK on `Application` (required by the resume picker in Step 3.3):

```prisma
model Application {
  // ...existing fields
  resumeId String
  resume   Resume @relation(fields: [resumeId], references: [id])
}
```

- Check existing `NotificationType` enum for a value already implied by Step 2.10's trigger list ("New applications"). Reuse it; only add a new enum value if genuinely missing.
- Run `npx prisma format && npx prisma validate && npx prisma generate`, then `npx prisma migrate dev --name user-resume-application-fields`.

Verification: `npx prisma validate` passes; `npx prisma studio` shows `Resume` and `Application.resumeId` columns.

---

#### Step 3.1: User Profile

Architecture Constraint: Plain form → Server Action (matches recruiter `upsert-company.ts` pattern).

Files to Create/Edit:

- `app/features/user/schema/profile.schema.ts`
- `app/features/user/actions/upsert-profile.ts`
- `app/features/user/components/profile-form.tsx`
- `app/features/user/components/experience-list-editor.tsx`
- `app/features/user/hooks/use-profile.ts`
- `app/(roles)/user/profile/page.tsx`

Actionable Tasks:

```ts
// profile.schema.ts
export const ExperienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().nullable(),
  description: z.string().max(2000).optional(),
});
export const ProfileSchema = z.object({
  skills: z
    .array(z.string().min(1))
    .max(50)
    .transform((arr) => [...new Set(arr)]), // dedupe
  workMode: z.nativeEnum(WorkMode),
  payExpectations: z.coerce.number().int().nonnegative().optional(),
  experiences: z.array(ExperienceSchema).max(20),
});
```

- `upsert-profile.ts`: `await requireRole(['user'])` → throws `UnauthorizedError`/`ForbiddenError` from `lib/api-error.ts`. Parse with `ProfileSchema`; throw `ValidationError` on failure. `prisma.userProfile.upsert({ where: { userId }, ... })`. `revalidatePath('/user/profile')`.
- `experience-list-editor.tsx`: RHF `useFieldArray`, add/remove rows, date validation (`endDate` null = "Present").
- Page: server component, fetch existing profile, pass as `defaultValues` or render empty form.

Verification: submitting with a malformed `payExpectations` (negative) returns a field-level Zod error in the form, not a 500; resubmitting an existing profile updates in place (no duplicate `UserProfile` rows).

---

#### Step 3.2: Resumes & In-App Builder (Lightweight Form-Based)

**Scope Clarification:** This is NOT a professional resume-builder SaaS (like Indeed/LinkedIn/Canva). It is a lightweight, form-based resume data manager embedded within the hiring platform. Users can:

- Upload PDF/DOCX files directly (most common).
- Build a basic resume using a structured JSON form (education, experience, skills, summary) — if any best library available for nextjs react resume builder use it otherwise **no rich editor, no templates, no WYSIWYG drag-and-drop, no PDF export**. The preview is HTML-rendered JSON, not a polished PDF.
- Mark one resume as primary (used by default in applications).
- AI enhancement optional (Step 3.2b) — suggestions only, not generative PDF output.

Architecture Constraint: File upload → REST `POST /api/user/resumes`. Builder JSON save → Server Action.

Files to Create/Edit:

- `app/features/user/schema/resume.schema.ts`
- `app/api/user/resumes/route.ts` (GET list, POST upload)
- `app/api/user/resumes/[id]/route.ts` (PATCH set-primary, DELETE)
- `app/features/user/actions/save-resume-builder.ts`
- `app/features/user/components/resume-list.tsx`
- `app/features/user/components/resume-upload-button.tsx`
- `app/features/user/components/resume-builder-form.tsx`
- `app/features/user/components/resume-preview.tsx`
- `app/features/user/hooks/use-resumes.ts`
- `app/(roles)/user/resumes/page.tsx`

Actionable Tasks:

- Before writing the upload route, read `lib/upload.ts`'s return shape and `app/api/files/download/route.ts`'s lookup logic. Derive the resume's `fileUrl` (fileId) exactly the way that download route expects — do not invent a second file-resolution scheme.
- `POST /api/user/resumes`: `requireRole(['user'])`. Validate `multipart/form-data` — accept only `application/pdf`, `application/msword`, `.docx` mime types, max 5MB; throw `ValidationError` otherwise. Cap at 5 resumes per user; throw `ValidationError` ("Resume limit reached") past that. Call `lib/upload.ts`, insert `Resume` row with `builderData: null` (file-uploaded type).
- `GET /api/user/resumes`: list own resumes, newest first. Include `{ id, fileName, fileType, builderData, isPrimary, createdAt }` — no large file content. This powers the Step 3.3 resume picker — do not build a second listing endpoint there.
- `PATCH /api/user/resumes/[id]` (set primary): `$transaction([unset all other isPrimary, set this one])`.
- `DELETE /api/user/resumes/[id]`: ownership check; block deletion (`ValidationError`) if `resumeId` is referenced by any existing `Application` — surface "Used in N application(s), cannot delete" instead of a hard FK error.
- Resume download/view anywhere in the app (this page, recruiter's existing applicant-detail view) must route through `app/api/files/download/route.ts`. Extend that route's auth check to also allow `userId === resume.userId` (self-download) alongside the existing recruiter-applicant relationship check — do not fork a second download route.
- `resume-builder-form.tsx` + `save-resume-builder.ts`: Server Action, `requireRole(['user'])`, Zod-validate builder JSON, throw `ValidationError` on malformed shape, persist into `Resume.builderData` as JSON (create a builder-type `Resume` row with `fileUrl: null` and `builderData: { ... }` — file-based and builder-based resumes coexist).
- `resume-builder-form.tsx` schema: `{ summary: string, educations: [{ school, degree, field, graduationYear }], experiences: [{ company, title, startYear, endYear, description }], skills: string[] }`. Use RHF + `useFieldArray` for dynamic sections. **No file upload here** — this is JSON-only.
- `resume-preview.tsx`: if `builderData` exists, render as plain HTML/Tailwind (minimal styling, no PDF). If `fileUrl` exists, show a "View File" link via `/api/files/download`. Do not generate/export PDF from the builder.

Verification: uploading a 6th resume returns a 422 with the limit message; uploading a `.exe` is rejected client- and server-side; deleting a resume attached to an application is blocked with a clear error; resume opens via `/api/files/download?...` returns 200 only for the owner or a recruiter with a valid relationship, 403 otherwise; builder-created resume stores and retrieves JSON without corruption.

---

#### Step 3.2b (NEW, Optional): AI-Powered Resume Assistance

**Scope:** Lightweight AI suggestions/improvements, not generative content replacement. Use Claude API (`claude-sonnet-4-6`) via a new route `POST /api/user/resumes/[id]/ai-enhance/route.ts` to:

1. Analyze the resume (file or JSON).
2. Suggest improvements: bullet-point rewrites for experiences, skill relevance, missing sections, ATS optimization tips.
3. **Never modify the resume directly** — return suggestions only; user decides what to apply.
4. I may change AI providers later.
   Files to Create/Edit:

- `app/features/user/schema/resume-ai.schema.ts`
- `app/api/user/resumes/[id]/ai-enhance/route.ts`
- `app/features/user/actions/apply-ai-suggestions.ts`
- `app/features/user/components/ai-suggestions-panel.tsx`
- `app/features/user/hooks/use-ai-resume-enhance.ts`
- `lib/ai-client.ts` (thin wrapper around AI API)

Actionable Tasks:

- `resume-ai.schema.ts`:

```ts
export const ResumeSuggestionSchema = z.object({
  type: z.enum([
    "bullet_improvement",
    "skill_addition",
    "section_expansion",
    "ats_optimization",
    "grammar",
  ]),
  section: z.string(), // 'experience', 'education', 'skills', etc.
  original: z.string().optional(),
  suggestion: z.string(),
  reasoning: z.string().max(500),
  priority: z.enum(["high", "medium", "low"]),
});
export const EnhancementsResponseSchema = z.object({
  suggestions: z.array(ResumeSuggestionSchema),
  overallScore: z.number().min(0).max(100), // ATS/quality score
  keyStrengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
});
```

- `lib/ai-client.ts`: Thin wrapper:

```ts
export async function callClaudeAPI(userPrompt: string, systemPrompt?: string, maxTokens = 1024) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}
```

- `app/api/user/resumes/[id]/ai-enhance/route.ts`:
  - `requireRole(['user'])`.
  - Fetch resume (file or builder JSON).
  - For file uploads: extract text using `pdf-parse` (PDF) or `mammoth` (DOCX) — **text-only, no OCR**.
  - Build a system prompt:

```
You are a professional resume coach. Analyze the resume and provide specific, actionable suggestions for:
1. Improving experience descriptions with strong action verbs and quantifiable results.
2. Highlighting relevant skills for tech/non-tech roles.
3. ATS (Applicant Tracking System) optimization (proper formatting, keyword density, section clarity).
4. Grammar, clarity, and professional tone.

Respond ONLY with valid JSON matching this schema: { suggestions: [...], overallScore: <0-100>, keyStrengths: [...], improvementAreas: [...] }
```

- Call `callClaudeAPI(resumeText, systemPrompt)` with the full resume text.
- Parse response with `EnhancementsResponseSchema`. Throw `ValidationError` if malformed.
- Rate-limit: 3 enhance requests per user per day. Check count in `ResumeEnhancementLog` table (or Redis if set up). Throw `TooManyRequestsError` ("Daily AI enhancement limit reached").
- Return `{ success, data: EnhancementsResponse }`.

- `ResumeEnhancementLog` schema migration:

```prisma
model ResumeEnhancementLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  resumeId  String
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

- `ai-suggestions-panel.tsx`: client component. Display suggestions grouped by type/priority. Each has "Copy to clipboard" button (for quick paste into builder form) and priority badge. "Apply" button for each suggestion (Step 3.2b below) — never auto-apply.

- `apply-ai-suggestions.ts`: Server Action, `requireRole(['user'])`. Accept `resumeId` + array of `suggestionIds`. For each: update corresponding field in `Resume.builderData` (for builder resumes) OR reject with `ValidationError` (for file uploads — users must re-download, edit externally, re-upload). Return updated resume. Invalidate resume query.

- `use-ai-resume-enhance.ts`:

```ts
export function useAiResumeEnhance(resumeId: string) {
  return useMutation({
    mutationFn: async () =>
      apiClient(`/api/user/resumes/${resumeId}/ai-enhance`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "resumes"] });
    },
  });
}
```

- Page integration: In `/user/resumes/page.tsx`, add "✨ AI Suggestions" button on each resume card:
  - Calls `useAiResumeEnhance(resumeId)`.
  - Shows toast "Analyzing your resume...".
  - On success, opens modal with `ai-suggestions-panel.tsx`.
  - On error (rate limit, API failure), shows friendly message: "Unable to enhance right now. Try again later."

- Env vars: `ANTHROPIC_API_KEY` required. Validate in `.env.example` and deployment CI.

- Cost control: Claude Sonnet costs ~$0.003 per 1K input tokens; typical resume = 1K–3K tokens. Max 5/user/day = ~$0.02 daily worst-case per active user. Monitor usage via Claude API dashboard.

Verification: requesting AI enhance twice within 1 hour succeeds once, then returns 429 on second. Suggestions include ≥1 `bullet_improvement` type and priority levels. "Copy to clipboard" works (test with Playwright `navigator.clipboard`). "Apply" on builder resume updates JSON; "Apply" on file resume shows helpful error ("File-uploaded resumes cannot auto-apply suggestions — download and re-upload edited version"). Disabling `ANTHROPIC_API_KEY` causes graceful error in the UI ("AI features temporarily unavailable").

#### Step 3.3: Job Application Flow

Architecture Constraint: Complex mutation → REST `POST /api/jobs/[id]/apply`.

Files to Create/Edit:

- `app/api/jobs/[id]/apply/route.ts`
- `app/features/user/components/apply-button.tsx`
- `app/features/user/components/resume-picker-dialog.tsx`
- `app/features/user/hooks/use-apply.ts`

Actionable Tasks:

- Route: `requireRole(['user'])`. `prisma.job.findUnique` → throw `NotFoundError` if missing. **Also reject if `job.status !== 'active'` or `job.isActive === false`** with a `ValidationError` ("This position is no longer accepting applications") — do not rely on the client to hide the apply button only.
- Existing-application check → `ValidationError` ("You've already applied to this job").
- `$transaction`: create `Application` with the chosen `resumeId` (FK from Step 3.0c) and `status: 'applied'`, then immediately insert the first `ApplicationStatusChange` row (`fromStatus: null, toStatus: 'applied'`) so the timeline component built in Phase 2.6 works unmodified for the user side too.
- After the transaction commits, call the existing `createNotification` (from `lib/notifications.ts`) targeting the recruiter(s) of `job.companyId` — reuse `triggerForCompany` if it already fans out to all company recruiters. **Do not** send email here. **Do not** touch `viewCount` here (that's Step 4.2's route).
- Rate-limit applies per user (e.g. 30/hour) reusing the same pattern as `app/features/recruiter/libs/rate-limit-message.ts`; throw `TooManyRequestsError` past the limit.
- `apply-button.tsx`: disabled state if already applied (server-confirmed, not just client cache) or job inactive. Opens `resume-picker-dialog.tsx`, which calls `GET /api/user/resumes` (Step 3.2) — do not refetch resumes via a new endpoint.
- On success: invalidate the job's query key and `['user','applications']` so Step 3.4's list updates without a refresh.

Verification: applying twice to the same job returns the friendly duplicate error on the second attempt; applying to a `status: 'archived'` or `isActive: false` job is rejected even via direct API call; recruiter's existing notification bell (Phase 2.10/1.6 Pusher wiring) shows the new-application event live without any new realtime code.

---

#### Step 3.4: User Activity Panel (My Applications)

Files to Create/Edit:

- `app/features/user/queries/list-my-applications.ts`
- `app/features/user/hooks/use-my-applications.ts`
- `app/features/user/components/applications-table.tsx`
- `app/(roles)/user/applications/page.tsx`

Actionable Tasks:

- `list-my-applications.ts`: `requireRole(['user'])`, filter `userId`, support `?status=` and pagination via the same URL-searchParams pattern used in admin/recruiter tables (reuse `lib/pagination.ts`).
- `applications-table.tsx`: built on the existing `components/ui/data-table.tsx` (reuse, do not fork). Columns: Job title, Company, Status (`status-badge.tsx`), Applied date, Actions (View Detail → Step 3.5).
- Expandable row or tooltip shows `rejectionReason` when present — reuse the exact pattern from the recruiter applicant view, not a new implementation.
- Edge case — empty state: distinct copy for "no applications yet" vs "no results match this filter."
- Bonus (optional): "Export My Applications (CSV)" button reusing the CSV builder. If reused outside recruiter scope, relocate `app/features/recruiter/libs/csv-builder.ts` → `lib/csv-builder.ts` and update the recruiter import — do not duplicate the RFC4180 logic.

Verification: filtering `?status=rejected` server-side returns only rejected rows; pagination controls match the admin/recruiter table's existing UX exactly (same component, same props).

---

#### Step 3.5 (NEW): Application Detail, Withdraw & Message Recruiter

Goal: Mirror the recruiter's Applicant Detail View (Phase 2.6) from the user's side, and close the loop with messaging.

Architecture Constraint: Withdraw is a simple state mutation (no file, no webhook) → Server Action, consistent with Step 3.1/3.2's builder save.

Files to Create/Edit:

- `app/(roles)/user/applications/[id]/page.tsx`
- `app/features/user/components/application-detail.tsx`
- `app/features/user/actions/withdraw-application.ts`
- `app/features/user/hooks/use-application-detail.ts`

Actionable Tasks:

- Page: fetch application with ownership check (`application.userId === session.user.id`, else `ForbiddenError`).
- Content: job + company summary, resume used (link via `/api/files/download`), full status timeline (reuse `components/shared/status-timeline.tsx` against the `ApplicationStatusChange` rows — same component the recruiter side already uses, fed with this application's history), "Message Recruiter" button.
- `withdraw-application.ts`: `requireRole(['user'])`, ownership check, only allowed while `status` is `applied` or `reviewing` (block with `ValidationError` once `interview_scheduled`/`offered`/`hired`/`rejected`); set `status: 'withdrawn'` — **add `withdrawn` to the `ApplicationStatus` enum** if missing, insert an `ApplicationStatusChange` row, notify the recruiter via `createNotification`. Confirm via `components/shared/confirm-action-button.tsx` (reuse, don't rebuild a confirm dialog).
- "Message Recruiter": compute the thread id with the existing `computeThreadId` util (same one used in Step 2.5) against the company's primary recruiter. Generalize `verify-recruiter-applicant-relationship.ts` to accept either calling direction instead of writing a second relationship check. Navigate to `/user/messages?thread={id}`; confirm `user-thread-view.tsx` already supports rendering an empty/new thread (no messages yet) — extend it only if it currently assumes a non-empty thread. I think message already written for it, check it. if any thing missing then add it.

Verification: withdraw is blocked with a 422 once status has moved past `reviewing`; withdrawing notifies the recruiter (visible in their existing notification dropdown, no new realtime code needed); "Message Recruiter" on an application with zero prior messages opens an empty thread ready to send the first message.

---

#### Step 3.6 (NEW, optional): Saved / Bookmarked Jobs

Goal: Lightweight bookmarking, consumed by Phase 4's public job listing.

Actionable Tasks:

- Schema: `model SavedJob { id String @id @default(uuid()) userId String job Job @relation(...) jobId String createdAt DateTime @default(now()) @@unique([userId, jobId]) }`. Migrate.
- `app/api/user/saved-jobs/route.ts` (GET list, POST save), `app/api/user/saved-jobs/[jobId]/route.ts` (DELETE).
- `app/features/user/hooks/use-saved-jobs.ts`.
- `app/(roles)/user/saved-jobs/page.tsx` reusing `applications-table.tsx`'s table shell with a Job-shaped column set instead of Application-shaped.
- Add a bookmark toggle icon, consumed by `job-card.tsx` in Phase 4.1 — build the icon component once in `app/features/user/components/save-job-button.tsx` and import it there rather than duplicating the toggle logic per surface.

Verification: saving the same job twice is a no-op (unique constraint caught and converted to a friendly response, not a 500); unauthenticated users see a login prompt instead of a broken toggle.

---

## Phase 4: Public Job Routes & Home Page

#### Step 4.0 (NEW): Public Route Group & Shared Shell

Objective: Give marketing/public pages a consistent chrome without touching the existing `(roles)` layouts.

Files to Create/Edit:

- `app/(public)/layout.tsx`
- `components/layout/navbar.tsx`
- `components/layout/footer.tsx`

Actionable Tasks:

- Move (or create fresh, if not yet built) the root `page.tsx`, `jobs/page.tsx`, `jobs/[id]/page.tsx` under `app/(public)/...` — route group folders don't affect the URL, so `/`, `/jobs`, `/jobs/[id]` are unchanged.
- `app/(public)/layout.tsx` wraps children with `<Navbar />` and `<Footer />`. This is separate from `RoleLayoutClient`/`Sidebar` used inside `(roles)` — do not merge the two shells.
- Navbar built here is a placeholder shell; role-aware link logic is finished in Step 4.3 once session-fetching needs are clear.

Verification: `/`, `/jobs`, and any future public route render with Navbar+Footer with zero duplicated layout code; `(roles)` pages are unaffected (still render Sidebar, no Navbar/Footer leakage).

---

#### Step 4.1: Public Job Listings

Files to Create/Edit:

- `app/features/public/queries/list-public-jobs.ts`
- `app/features/public/schema/public-job.schema.ts`
- `app/features/public/hooks/use-public-jobs.ts`
- `app/(public)/jobs/page.tsx`
- `app/features/public/components/job-card.tsx`
- `app/features/public/components/job-search-bar.tsx`
- `app/features/public/components/job-filter-sidebar.tsx`

Actionable Tasks:

- `list-public-jobs.ts`: **must filter `status: 'active'` AND `isActive: true`** (two independent gates — recruiter-owned status from Phase 2.3, admin kill-switch from Phase 1.4). Missing either condition silently leaks archived or admin-deactivated jobs.
- No auth required; all filters (`q`, `workMode`, `location`, `industry`, pagination) live in `searchParams`, identical convention to the recruiter/admin tables.
- `job-search-bar.tsx`: debounce input using the same debounce approach as `people-table.tsx`'s admin search (reuse the hook/util if one was extracted, don't rewrite debounce logic from scratch).
- `job-card.tsx`: include the bookmark toggle from Step 3.6 (`save-job-button.tsx`) only when a session exists; render nothing (not a broken button) for anonymous visitors.
- Loading state: reuse `components/ui/skeleton.tsx` for the card grid, not a bespoke spinner.
- Empty state: distinct copy for "no jobs posted yet" vs "no results for these filters."

Verification: an admin-deactivated-but-recruiter-active job never appears in `/jobs`; clearing all filters restores the full active list without a full page reload.

---

#### Step 4.2: Public Job Details & View Tracking

Architecture Constraint: View increment = REST `POST /api/jobs/[id]/view`, fire-and-forget, the one sanctioned fetch-on-mount exception.

Files to Create/Edit:

- `app/(public)/jobs/[id]/page.tsx`
- `app/api/jobs/[id]/view/route.ts`
- `app/features/public/components/view-tracker.tsx`
- `app/features/public/components/company-preview-card.tsx`

Actionable Tasks:

- Page: `prisma.job.findUnique`. If truly absent → Next.js `notFound()` (real 404). If it exists but `status !== 'active'` or `isActive === false` → render a distinct "This position is no longer available" state with a link back to `/jobs`, **not** a 404 — these are different failure modes and must look different to a user who bookmarked an old link.
- `view-tracker.tsx`: client component, `useEffect` on mount, `POST /api/jobs/[id]/view`. Dedupe with a 30-minute `sessionStorage` flag keyed `view:{jobId}` so refresh/back-nav doesn't inflate `viewCount`.
- View route: increment `viewCount` only — no notification, no status check needed (viewing an inactive job via direct link shouldn't 500, just don't increment if you choose to guard it).
- Assemble the page with `apply-button.tsx` + `resume-picker-dialog.tsx` (Step 3.3) and `company-preview-card.tsx` (new — `Company.name/description/website/logoUrl/industry` from Phase 2.1).

Verification: refreshing the same job page within 30 minutes does not double-increment `viewCount`; visiting a never-existing job id returns a real 404; visiting an archived job id returns the "no longer available" state with a 200, not a 404.

---

#### Step 4.3: Home Page & Role-Aware Navbar

Files to Create/Edit:

- `app/(public)/page.tsx`
- `components/layout/navbar.tsx` (finish the Step 4.0 placeholder)

Actionable Tasks:

- Home page: hero, featured jobs (reuse `job-card.tsx` from 4.1, do not rebuild), "how it works", footer. `motion/react` scroll-into-view, animations <300ms.
- Navbar: fetch session server-side. Role-aware destination for the primary CTA:
  - no session → Login/Register
  - `role: 'admin'` → `/admin`
  - `role: 'recruiter'` → `/recruiter`
  - `role: 'user'` → `/user`
- Edge case: `session.user.isBanned === true` → don't link to the role dashboard (middleware would just bounce them to `/banned` anyway); instead show an "Account Restricted" indicator linking directly to `/banned`.
- Include the same shared `notification-dropdown.tsx` in the navbar when a session exists, so a logged-in user browsing the public site still sees their bell — reuse the component as-is, it's already role-aware.

Verification: logged-out, recruiter, user, admin, and banned-user sessions each render the correct, distinct navbar state with no client-side flash of the wrong state (resolve role server-side before render).

---

#### Step 4.4 (NEW): SEO — Metadata, Sitemap & Robots

Goal: Make public job listings indexable; keep authenticated areas out of search engines.

Files to Create/Edit:

- `app/(public)/jobs/[id]/page.tsx` (add `generateMetadata`)
- `app/sitemap.ts`
- `app/robots.ts`

Actionable Tasks:

- `generateMetadata` per job: `title: "${job.title} at ${company.name}"`, `description` truncated from `job.description`, Open Graph fallback image if `company.logoUrl` absent.
- `app/sitemap.ts`: static entries (`/`, `/jobs`) + dynamic entries for every job where `status: 'active' AND isActive: true` (same dual-gate filter as Step 4.1 — do not re-derive a different filter here).
- `app/robots.ts`: disallow `/admin`, `/recruiter`, `/user`, `/api`; allow everything else.

## Verification: `/sitemap.xml` lists only currently-active jobs (archived/deactivated jobs disappear from it automatically as their status flips); `/robots.txt` disallows all role-prefixed paths.

---
