# My details:

Currently working on a job board platform for a portfolio to get hired. In this app I created authentication using Better Auth, Prisma, Next.js, and TypeScript. I already have an AGENT.md file in my root directory. In the prisma.schema file that holds models, I set user model roles \[user, admin, and recruiter]. I'm using AI agents to build for me. What I want now is to know which order to create from first to last routes, models, and components based on role to avoid confusion in agent flow and reduce token usages. I want prima models, components, pages, and route paths; use my glocals.css style (which has a theme setup). If an API is needed, like GET or POST, then add any necessary REST APIs.

## Current project setup:

My current tools have free tiers, such as the GitHub Copilot, Cursor agent, and the Antigravity agent. My packages are Next.js 16 (App Router), TypeScript 5, Motion for animations, react-icons, Shadcn UI (Base), Zod 5, Tailwind CSS v4, Better Auth, and React 19.

Each role has specific features.

**ADMIN:**

Full control over recruiters, users, job posts, adding fellow team members, and analytics about job posts, recruiters, and users. Able to ban recruiters and users. Own dashboard. Direct message to any recruiter and user.

**RECRUITER:**

Able to create a company profile, links, and social links; create job posts; see applied user profiles and resumes; job post analytics like views and applications; and advanced filters on jobs and users. Direct message (built-in chat box) any users if they applied to the job post and reject users if they are not a fit for the particular job.

**USER:**

Create your own profile and add experiences, skills, resumes, work mode, base pay, CTC, ECTC, and location. Able to apply to job posts based on job preference, like software developer or backend developer. Activity panels like applied post and status like recruiter viewed, application rejected, etc., and get notifications about this inside the application; be able to see the recruiter's profile from the job posts; have an in-built resume builder if they don't have a resume; and have social links and portfolio links that are shared to the applied job post. able to reply to messages from recruiters inside the built-in chat box.

All roles have a navbar. I'm not sure if this navbar is the same for every role or specific for each one. Maybe create a reusable component and change data.

**Job posts:**

It has a title, description, locations, work mode, time zone, skills, tags, and experience.

**Routes:**

want to create routes for admin, user, recruiter, and jobs. The jobs route is public; anyone can search and filter jobs from here, but to apply, they have to sign up.

routes like admin/…, recruiter/…, user/…, jobs/…

Each has specific functionality, like create, post, delete, view, update, and more. So create all necessary routes.

Home Page (domain.com/)

Here I want to create a homepage for a job board. I'm not sure what type of section is needed, like contact, hero, etc., so create yourself about this.

**Goal:**

I want you to make the above project details and recruitments very efficient, add any missing details for this job board platform, and turn it into the best prompt to put on Claude/Gemini for planning to create prompts for each specific thing, like users/admins, etc., to put on chat agents/agents to create codes. I want you to judge priority on the description to create main things first and follow-ups. I just need you to clean and structure this into the best prompt, then other LLMs use your given prompt and give output prompts and flows for each recruitment.

# **DEEPSEAK PROMPT:**

You are a senior full‑stack architect and technical planner. Your task is to take the following job‑board project specification and turn it into a **phased, ordered development roadmap** consisting of **prompts for AI coding agents** (like Cursor, Copilot, Antigravity). Each prompt must be a self‑contained, step‑by‑step task that an agent can execute sequentially, avoiding confusion and minimising token waste.

**Output format:**

- Break the roadmap into **Phases** (foundation → role features → public pages → polish).

- Inside each Phase, list **numbered Steps**.

- For every Step provide:

- **What to build** (models, API endpoints, pages, components)

- **Exact file paths** (relative to the Next.js App Router project root)

- **Specific instructions** (e.g. “create Prisma model …”, “add form with Zod validation”, “use the global.css theme variables”)

- **Dependencies** (which previous steps must be completed)

- **Acceptance criteria** (what to test to know it works)

- For any REST API needed, define the route (method + path) and what it does.

- **Prioritise strictly**: base infrastructure first, then admin (to manage others), then recruiter, then user, then public job routes, and finally messaging & notifications.

---

### PROJECT CONTEXT

**Stack:** Next.js 16 (App Router), TypeScript 5, Prisma, PostgreSQL, Better Auth, Tailwind CSS v4, Shadcn UI, Motion, react-icons, Zod 5, React 19.

**Authentication:** Better Auth already set up, user roles in Prisma schema: `[user, admin, recruiter]`.

**Existing file:** `prisma.schema` has a User model with roles.

**Styling:** All components must use the custom theme set in `globals.css`. Use Tailwind utility classes and Shadcn UI components, never hard‑code colours; reference theme variables via Tailwind classes (e.g. `bg-primary text-primary-foreground`).

**Core features per role:**

- **ADMIN**

- Full control over recruiters, users, job posts

- Add fellow admin team members

- Ban/unban recruiters & users

- Analytics dashboard: job posts, recruiter activity, user growth

- Direct message any recruiter or user

- Own admin dashboard

- **RECRUITER**

- Create company profile (name, logo, website, social links)

- Create / edit / delete job posts

- See applied users’ profiles, resumes, application status

- Job post analytics (views, applications, conversion)

- Advanced filters on jobs & user database

- Built‑in chat box: message users who applied, reject applicants with reason

- Recruiter dashboard

- **USER**

- Create profile: experiences, skills, resume(s), work mode, base pay, CTC, ECTC, location

- Apply to jobs; filter jobs by preference (title, category)

- Activity panel: applied posts, status (viewed, rejected, accepted), in‑app notifications

- View recruiter’s company profile from a job post

- In‑built resume builder (if no resume uploaded)

- Social links, portfolio links shared with application

- Reply to recruiter messages in built‑in chat box

- User dashboard

- **JOB POSTS (public)**

- Title, description, locations, work mode (remote/hybrid/onsite), timezone, skills, tags, experience level

- Public search & filter (anyone can browse, login required to apply)

- Routes: `/jobs`, `/jobs/[id]`

- **HOME PAGE** (`/`)

- Hero section, featured jobs, how it works, contact/sign‑up CTA, testimonials, footer

- Use Motion for animations

- **NAVBAR**

- Shared base component with role‑based items (admin links, recruiter links, user links, public links)

- Conditional rendering based on session

- **MESSAGING**

- Built‑in real‑time chat (simple WebSocket or polling via Next.js API routes)

- Admin ↔ user/recruiter, Recruiter ↔ applicant user

- Message threads tied to job applications where applicable

- **NOTIFICATIONS**

- In‑app toast / bell icon with list

- Events: application status change, new message, recruiter viewed profile, admin ban/unban

---

### WHAT I NEED YOU TO OUTPUT

A complete **phased development plan** in the form of sequential **agent prompts**. The plan must:

1\. Start with **Prisma models** (extend the existing User model, add all necessary models).

2\. Set up **layouts, middleware, and protected routes** for each role.

3\. Build **admin features first** (to have management capabilities early), then recruiter, then user.

4\. Add **public job routes**, then homepage, messaging, notifications.

5\. Include **all necessary REST API endpoints** (Next.js route handlers) for mutations like applying to a job, sending messages, updating profiles, etc.

6\. Use the **exact file structure** of the Next.js App Router (`src/app/` or just `app/`; `prisma/`, `components/`, `lib/`, etc.).

7\. **Never skip dependencies** – if a step uses a component, that component must be built earlier (or clearly marked as a prerequisite).

8\. Keep prompts **token‑efficient**: group related models, API endpoints, and pages into one prompt when they share dependencies.

---

### SUPPLEMENTARY DETAILS (I added missing parts to make the platform complete)

- **Prisma models needed:**

- `User` (already exists, add profile fields)

- `UserProfile` or extend User with one‑to‑one relation (experiences, skills, resume URLs, etc.)

- `Resume` (could be separate model for builder)

- `Company` (recruiter creates one company profile)

- `Job` (posts by recruiter)

- `Application` (user applies, status: applied/viewed/rejected/accepted)

- `Message` (sender, receiver, thread, content, read)

- `Notification` (userId, type, read, data JSON)

- `AdminTeam` / `AdminInvite` (to add fellow admins)

- `Ban` (record of banned userId, reason, by admin)

- **Route groups:**

- `(admin)` → `/admin/dashboard`, `/admin/recruiters`, `/admin/users`, `/admin/jobs`, `/admin/analytics`, `/admin/team`, `/admin/messages`

- `(recruiter)` → `/recruiter/dashboard`, `/recruiter/company`, `/recruiter/jobs`, `/recruiter/applicants`, `/recruiter/messages`, `/recruiter/analytics`

- `(user)` → `/user/dashboard`, `/user/profile`, `/user/applications`, `/user/resume-builder`, `/user/messages`, `/user/notifications`

- Public: `/jobs`, `/jobs/[id]`, `/`

- **API endpoints** (use Next.js route handlers under `app/api/` or inside route groups for role‑based API):

- `POST /api/jobs/[id]/apply`

- `POST /api/messages/send`

- `GET /api/messages/[threadId]`

- `GET /api/notifications`

- `PATCH /api/notifications/read`

- `PUT /api/recruiter/company`

- `POST /api/admin/ban`

- etc.

- **Analytics:** simple aggregated counts and charts (can use recharts or Shadcn chart).

---

Now, based on all the above, generate the **phased roadmap with agent prompts**. Start with Phase 0 (project base), then go role by role. Ensure that each step is a prompt an AI agent can directly follow.

## Begin your output now.

# **CLAUDE OUTPUT REFINE WITH GEMENI**

I completely understand why the original document felt a bit confusing. While it had good information, it was written more like a narrative design document than a strict set of executable commands. AI coding agents perform best with highly structured, constraint-driven prompts that leave no room for architectural drift.

I have rewritten and reorganized your roadmap. I converted it into an **Agent-Optimized Prompt Sequence**. I also added three critical missing steps that would have blocked an agent: **Project Initialization (0.0)**, a **Mock Upload Provider (0.4)** so image/resume handling doesn't halt development, and a **Database Seed Script (0.5)** so you can actually test the UI.

Here is your new, prompt-efficient `hire-flow-roadmap.md`. You can copy and paste each block between the `---` dividers directly into Cursor, Copilot, or Antigravity.

---

**# hire-flow-next — Agent Prompt Roadmap**

**How to use this document:** 1. Add the **Global Context** to your project's `.cursorrules` or `AGENTS.md` file.

**2. Copy and paste the contents of one **Step** at a time into your agent's chat.**

**3. Do not skip steps; the agent relies on the chronologically built files.**

---

**### GLOBAL CONTEXT (Add to `.cursorrules` or system prompt)**

**```markdown**

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

### Phase 3: User

**#### Step 3.0: User Infrastructure & Navigation (NEW)**_Prompt to Agent:_

- Build the foundational layout and navigation for the user dashboard.
- **Layout & Sidebar:** Create app/(roles)/user/layout.tsx that wraps all user pages. Build features/user/components/user-sidebar.tsx with navigation links to: **Dashboard**, **Profile**, **Resumes**, **Applications**, and **Notifications**.
- **User Dashboard:** Build /user/dashboard/page.tsx. Show a personalized summary: current application statuses, recent job views, and recommended quick actions (e.g., "Complete your profile", "Upload a resume"). Reuse shared stat cards.
- **Notification Bell (User):** Integrate the shared notification-bell.tsx into the user layout header. Ensure it fetches notifications for the user (e.g., status updates from recruiters).
- The recruiter layout MUST use `<RoleLayoutClient>` from `components/layout/role-layout-client.tsx` and inject a `<Sidebar>` from `components/layout/sidebar.tsx` (see `admin-layout-client.tsx` for the exact pattern).
- Create `RecruiterSidebar` as a simple component that passes role‑specific `links`, `roleLabel`, `homeHref` to the shared `Sidebar`.
- Same for the user layout and `UserSidebar`.
- Create directories:
  `app/features/recruiter/{actions,components,queries,schema,libs,hooks}`
  `app/features/user/{actions,components,queries,schema,libs,hooks}`
- Include a **Messages** link in the sidebar (e.g., `/user/messages`).
- Build a minimal `/recruiter/messages/page.tsx` that displays a “Coming soon” or reuses the shared `MessageBubble` / `StartConversationSearch` to let recruiters start conversations immediately.

**#### Step 3.1: User Profile (UPDATED)**_Prompt to Agent:_

- Build the user profile editor.
- **Architecture Constraint:** Plain form. USE A SERVER ACTION (upsert-profile.ts).
- **Form UI:** Build profile-form.tsx. Use RHF useFieldArray for an experience-list-editor.tsx (dynamic add/remove rows).
- **Action:** Build upsert-profile.ts. Verify session via requireRole(\['user'\]) (throws UnauthorizedError/ForbiddenError). Throw ValidationError for schema failures. Persist skills, workMode, payExpectations, and JSON experiences.
- **Page:** Build /user/profile/page.tsx. Pre-fill with existing data fetched server-side.
- **Query Hook:** Build a corresponding TanStack Query hook.

**#### Step 3.2: Resumes & In-App Builder (UPDATED)**_Prompt to Agent:_

- Handle resume uploads, structured resume building, and selection for applications.
- **Architecture Constraint:** File Upload = REST POST /api/user/resumes. Builder Form = Server Action.
- **Upload API:** Create POST /api/user/resumes. Verify session. Use api-error.ts to throw ValidationError if the file payload is invalid or missing. Insert a Resume row.
- **List API:** Create GET /api/user/resumes to fetch all resumes for the logged-in user. This will power the resume picker in the application flow.
- **Builder Form:** Build resume-builder-form.tsx using a Server Action to save JSON into builderData. Throw ValidationError for malformed data.
- **Primary Resume:** Ensure marking one resume as isPrimary unsets it for the others (use a database transaction if supported).
- **Resume Preview (Optional but recommended):** Build a lightweight preview component to show the user how their structured resume looks.
- **Query Hooks:** Build corresponding TanStack Query hooks (use-resumes, use-upload-resume, use-update-resume).

**#### Step 3.3: Job Application Flow (UPDATED)**_Prompt to Agent:_

- Build the API and UI for applying to a job.
- **Architecture Constraint:** Complex mutation. USE REST POST /api/jobs/\[id\]/apply.
- **REST Route:** Throw NotFoundError from api-error.ts if the job doesn't exist. Check for an existing application and throw ValidationError with a user-friendly message if they already applied.
- **Route Logic:** Inside the route, create the Application, and create an in-app Notification for the recruiter. **DO NOT** send an email notification here, and **DO NOT** increment the view count.
- **UI Components:** Build apply-button.tsx (client component). It opens resume-picker-dialog.tsx (which fetches resumes from the GET /api/user/resumes endpoint). Disable the button if already applied.
- **Success Handling:** Ensure successful application invalidates relevant TanStack queries.
- **Query Hooks:** Build corresponding TanStack Query mutation hooks.

**#### Step 3.4: User Activity Panel (UPDATED)**_Prompt to Agent:_

- Build the user's view of applied jobs.
- **Query:** Create list-my-applications.ts. Protect with requireRole(\['user'\]).
- **Page:** Build /user/applications/page.tsx.
- **Data Table:** Replace custom application rows with the shared data-table.tsx. This provides sortable columns and consistent styling.
- **Rejection Reason:** Show the rejectionReason inline within the table via an **expandable row component or tooltip**, reusing the UI pattern established for admin ban-details and recruiter applicant views.
- **Filtering:** Store status filters (e.g., ?status=rejected) in URL searchParams, identical to the recruiter/admin table patterns.
- **Query Hooks:** Build corresponding TanStack Query hooks.

---

**### Phase 4: Public Job Routes & Home Page**

**#### Step 4.1: Public Job Listings**

**Prompt to Agent:**

**Objective:** Build public `/jobs` page with URL-driven filters.

**Actionable Tasks:**

1. Build `list-public-jobs.ts`. Only return `isActive === true`.

2. Build `/jobs/page.tsx`.

3. Build `job-search-bar.tsx`, `job-card.tsx`, and `job-filter-sidebar.tsx`. Store all filter states in `searchParams`. No auth required.

4. Build `features/public/hooks/use-public-jobs.ts` – a `useQuery` hook that calls the `list-public-jobs.ts` query and reacts to URL searchParams.

---

**#### Step 4.2: Public Job Details & View Tracking**

**Prompt to Agent:**

**Objective:** Build `/jobs/[id]` and track page views.

**Architecture Constraint:** Analytics event. USE REST `POST /api/jobs/[id]/view`.

**Actionable Tasks:**

1. Build the REST route for view increments (fire and forget).

2. Build a tiny client component that fires a `POST` to this route on `useEffect` mount (this is the ONLY exception allowed for fetch-on-mount).

3. Assemble `/jobs/[id]/page.tsx`, inserting the `apply-button.tsx` and `company-preview-card.tsx`.

4. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 4.3: Home Page & Global Navbar**

**Prompt to Agent:**

**Objective:** Build the landing page and role-aware navigation.

**Actionable Tasks:**

1. Build `/page.tsx` with hero, featured jobs (reuse `job-card.tsx`), how it works, and footer. Use `motion/react` for scroll-into-view animations (< 300ms duration).

2. Build `navbar.tsx`. Fetch session server-side.

3. Render links dynamically based on role (`user`, `recruiter`, `admin`, or public).

---

**### Phase 5: Messaging & Notifications**

**#### Step 5.1: Messaging & Real-Time Setup**

**Prompt to Agent:**

**Objective:** Build the core thread logic, data persistence endpoints, and integrate the real-time event broadcaster.

**Architecture Constraint:** Event-Driven WebSockets via Hosted Provider (Pusher). No interval polling.

**Actionable Tasks:**

1. Configure the server-side `pusher` SDK using environment variables (`PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_CLUSTER`).

2. Create `POST /api/messages/send`. Derive the unique thread ID server-side (`[smaller_userId]_[larger_userId]`). Enforce authorization rules: Users can only message applied recruiters/admins; recruiters can only message their active applicants/admins.

3. After successfully persisting the message to the database, trigger an immediate Pusher broadcast to the channel private-thread-[threadId] with the event type `new-message`, passing the newly created message object payload.

4. Create `GET /api/messages/[threadId]` to fetch initial historical messages in chronological order. Mark unread messages in this thread as read for the receiving user upon fetching.

5. Build `features/messaging/hooks/use-messages.ts` → `useQuery` fetches historical messages from `GET /api/messages/[threadId]`.

6. Build `features/messaging/hooks/use-send-message.ts` → `useMutation` that calls `POST /api/messages/send` and integrates with optimistic updates (the existing optimistic UI logic in `message-composer.tsx`).

---

**#### Step 5.2: Real-Time Subscriptions & Shared Chat UI**

**Prompt to Agent:**

**Objective:** Build the live WebSocket event listener and the core interactive chat interface.

**Actionable Tasks:**

1. Build `features/messaging/hooks/use-message-subscription.ts`. Initialize `pusher-js` client-side. Subscribe to the relevant private-thread-[threadId] channel on mount. Listen for `new-message` events and instantly append them to the local UI state. Ensure complete cleanup (unsubscribe and unbind) when the component unmounts.

2. Build `chat-window.tsx` to handle message arrays, identify current-user messages vs. recipient messages (`bg-primary text-primary-foreground` on the right vs. `bg-muted text-muted-foreground` on the left), and implement an automated scroll-to-bottom anchor on new incoming messages.

3. Build `message-composer.tsx` with a standard form input. Implement an **optimistic UI update** that instantly pushes the message to the local state array before the HTTP POST request finishes, falling back or showing an error indicator if the network request fails.

---

**#### Step 5.3: Wiring Chat into Role Pages**

**Prompt to Agent:**

**Objective:** Deploy the live chat workspace to protected dashboard routes and implement inbox feeds.

**Actionable Tasks:**

1. Replace the admin placeholder, and create dynamic routing pages at `/recruiter/messages/[threadId]` and `/user/messages/[threadId]`.

2. Fetch initial historical messages server-side in `page.tsx` via a direct database query or internal fetch, pass them to `chat-window.tsx` as initial props, and let the message subscription hook manage all real-time increments moving forward.

3. Build an inbox list view component (`inbox-sidebar.tsx`) displaying all active user threads, recent message snippets, and real-time unread badge counts. Optional: Subscribe the sidebar to a user-specific global notification channel to update unread badge counts across threads instantly.

---

**#### Step 5.4: Real-Time Notifications System**

**Prompt to Agent:**

**Objective:** Establish a fully live, event-driven notification ecosystem for global app alerts (e.g., application status changes, new messages outside active chat windows).

**Actionable Tasks:**

1. Create `GET /api/notifications` to retrieve recent alerts and `PATCH /api/notifications/read` to update a notification's status.

2. Create a server-side notification utility that triggers a Pusher broadcast to a secure, user-specific channel (`private-user-[userId]`) with the event `new-notification` whenever system events occur.

3. Build `features/notifications/hooks/use-notification-subscription.ts` to listen for these live global events.

4. Build `notification-bell.tsx` as a navigation header Popover component. Show a dynamic, live-updating badge count. Clicking a notification marks it as read in the database, decrements the badge, and deep-links the user directly to the targeted resource (e.g., specific application or chat thread).

5. Build `features/notifications/hooks/use-notifications.ts` → `useQuery` for initial list, plus `useMutation` for marking as read.

6. Use the Zustand chat store to track unread counts updated by the subscription, not API data.
