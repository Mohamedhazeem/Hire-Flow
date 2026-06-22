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

**### Phase 2: Recruiter**

**#### Step 2.1: Company Profile CRUD**

**Prompt to Agent:**

**Objective:** Build the one-time company profile setup.

**Architecture Constraint:** This is a plain form. USE A SERVER ACTION (`upsert-company.ts`).

**Actionable Tasks:**

1. Build `features/recruiter/components/company-form.tsx` using RHF/Zod. Include a field for `logoUrl` (utilize the mock upload route from Step 0.4 if needed).

2. Build `upsert-company.ts`. Validate session is recruiter. Upsert `Company` row linked to `recruiterId`.

3. Build `/recruiter/company/page.tsx`. Pre-fill if data exists.

4. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 2.2: Job Posts CRUD**

**Prompt to Agent:**

**Objective:** Allow recruiters to create, edit, and delete job posts.

**Architecture Constraint:** Create/Edit are plain forms -> USE SERVER ACTIONS. Delete is destructive -> USE REST `DELETE /api/recruiter/jobs/[id]`.

**Actionable Tasks:**

1. Build `job-form.tsx`. Ensure it accepts `defaultValues` so it can be reused for both Create and Edit pages.

2. Build Server Actions: `create-job.ts` and `update-job.ts`. Validate `companyId` belongs to the logged-in recruiter.

3. Build REST Route: `DELETE /api/recruiter/jobs/[id]`. Ensure cascade delete on applications.

4. Build `/recruiter/jobs`, `/recruiter/jobs/new`, and `/recruiter/jobs/[id]/edit` pages.

5. Build TanStack Query hooks:
   - `features/recruiter/hooks/use-jobs.ts` (useQuery)
   - `features/recruiter/hooks/use-create-job.ts` (useMutation calling Server Action)
   - `features/recruiter/hooks/use-delete-job.ts` (useMutation calling REST DELETE)

---

**#### Step 2.3: Applicants View & Status Updates**

**Prompt to Agent:**

**Objective:** Let recruiters view applicants and change statuses.

**Architecture Constraint:** Status change is a UI interaction. USE REST `PATCH`.

**Actionable Tasks:**

1. Create `PATCH /api/recruiter/applications/[id]/status`. Require `rejectionReason` if status is 'rejected'. Create a `Notification` for the applicant.

2. Build `/recruiter/jobs/[jobId]/applicants/page.tsx`.

3. Build `applicant-card.tsx` with a status select dropdown. If "rejected" is selected, trigger a `reject-dialog.tsx` to capture the reason before calling the API.
4. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 2.4: Recruiter Analytics & Filters**

**Prompt to Agent:**

**Objective:** Add analytics and job/applicant filtering.

**Actionable Tasks:**

1. Build `get-job-analytics.ts` (view counts, app counts, conversion rate).

2. Build `/recruiter/analytics/page.tsx` reusing `stats-cards.tsx`.

3. Build `job-filter-bar.tsx` and `applicant-filter-bar.tsx`.

4. State Management Rule: Store filter states in URL `searchParams` (e.g., `?status=accepted`), DO NOT use `useState` for the applied filters. Read them server-side.

---

**### Phase 3: User**

**#### Step 3.1: User Profile**

**Prompt to Agent:**

**Objective:** Build the user profile editor.

**Architecture Constraint:** Plain form. USE A SERVER ACTION (`upsert-profile.ts`).

**Actionable Tasks:**

1. Build `profile-form.tsx`. Use RHF `useFieldArray` for an `experience-list-editor.tsx` (dynamic add/remove rows).

2. Build Server Action to persist `skills`, `workMode`, pay expectations, and JSON `experiences`.

3. Build `/user/profile/page.tsx`.

4. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 3.2: Resumes & In-App Builder**

**Prompt to Agent:**

**Objective:** Handle resume uploads and structured resume building.

**Architecture Constraint:** File Upload = REST (`POST /api/user/resumes`). Builder Form = Server Action.

**Actionable Tasks:**

1. Create `POST /api/user/resumes` to accept a file URL metadata and insert a `Resume` row.

2. Build `resume-builder-form.tsx` using a Server Action to save JSON into `builderData`.

3. Ensure marking one resume as `isPrimary` unsets it for the others.

4. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 3.3: Job Application Flow**

**Prompt to Agent:**
**Objective:** Build the API and UI for applying to a job.

**Architecture Constraint:** Complex mutation. USE REST `POST /api/jobs/[id]/apply`.

**Actionable Tasks:**

1. Build REST route. Check for existing application (fail gracefully). Create `Application`. Create `Notification` for recruiter (type: `application_status`). DO NOT increment view count here.

2. Build `apply-button.tsx` (client component). Opens `resume-picker-dialog.tsx`. Disables if already applied.

3. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

---

**#### Step 3.4: User Activity Panel**

**Prompt to Agent:**

**Objective:** Build the user's view of applied jobs.

**Actionable Tasks:**

1. Create `list-my-applications.ts`.

2. Build `/user/applications/page.tsx`.

3. Render `application-row.tsx`. If status is rejected, show the `rejectionReason` inline in a collapsible section.

4. Build a corresponding TanStack Query hook in features/<role>/hooks/ (useQuery or useMutation).

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
