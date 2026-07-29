# 🚀 Hire Flow

<p align="center">
  <img src="https://raw.githubusercontent.com/Mohamedhazeem/hire-flow-next/master/public/images/Hire_Flow_Cover_1.png" alt="Hire Flow Cover" />
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="AI" src="https://img.shields.io/badge/AI-Multi%20Provider-8B5CF6?style=flat-square&logo=openai&logoColor=white" />
  <img alt="Better Auth" src="https://img.shields.io/badge/Auth-Better%20Auth-6366F1?style=flat-square" />
  <img alt="Pusher" src="https://img.shields.io/badge/Realtime-Pusher-300D4F?style=flat-square" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-443E38?style=flat-square" />
  <img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white" />
</p>

## About

Hire Flow is a production-grade job board and applicant tracking system (ATS) supporting three distinct user roles — **Admins**, **Recruiters**, and **Job Seekers** — with real-time messaging, AI-powered resume assistance, and a public-facing job marketplace with SEO built in from the ground up.

Built with **Next.js 16**, **React 19**, **Prisma 7**, and **Better Auth**, this project demonstrates end-to-end product thinking: tenant isolation, app-wide rate limiting, optimistic concurrency, audit trails, CI quality gates, and agent-assisted development workflows.

Designed and built by **Mohamed Hazeem** — a full-stack engineer focused on production-grade architecture, scalable systems, AI Integration and pragmatic feature scoping.

---

## 🧱 Tech Stack

| Category        | Technology                             | Version                          |
| --------------- | -------------------------------------- | -------------------------------- |
| Framework       | Next.js                                | `16.2.7`                         |
| UI Library      | React                                  | `19.2.4`                         |
| Language        | TypeScript                             | `^5`                             |
| ORM             | Prisma (+ `@prisma/adapter-pg`)        | `^7.8.0`                         |
| Database Driver | `pg`                                   | `^8.21.0`                        |
| Auth            | Better Auth (+ Prisma adapter)         | `^1.6.15`                        |
| Validation      | Zod                                    | `^4.4.3`                         |
| Data Fetching   | TanStack React Query                   | `^5.101.0`                       |
| Client State    | Zustand                                | `^5.0.14`                        |
| Forms           | React Hook Form (+ Hookform Resolvers) | `^7.78.0` / `^5.4.0`             |
| Realtime        | Pusher / pusher-js                     | `^5.3.4` / `^8.5.0`              |
| Email           | Resend + React Email                   | `^6.12.4` / `^6.6.1`             |
| Charts          | Recharts                               | `^3.8.1`                         |
| Animation       | Motion                                 | `^12.40.0`                       |
| PDF/DOC Parsing | `pdf-parse`, `mammoth`, `react-pdf`    | `^2.4.5` / `^1.12.0` / `^10.4.1` |
| Styling         | Tailwind CSS v4 + shadcn               | `^4` / `^4.11.0`                 |
| Date Handling   | date-fns                               | `^4.4.0`                         |
| File Storage    | Vercel Blob (provider abstraction)     | `^2.6.1`                         |
| Tooling         | ESLint 9, Prettier, Vitest, Stryker Mutator, tsx, cross-env               | —                                |

---

## ✨ Features

### 🛡️ Admin

- User & recruiter management with ban/unban and role assignment
- Session inspection and bulk session revocation
- Admin team management with invite-based onboarding
- Job oversight dashboard with platform-wide analytics
- Real-time admin messaging (Pusher-backed private channels)
- Read-only applicant detail view with resume fallback chain

### 🏢 Recruiter

- Company profile CRUD + team invite management + **company logo upload** (cloud storage)
- Full job posting lifecycle (draft → active → archived)
- **7-status applicant pipeline** with optimistic concurrency control
- **Bulk actions**: mass status transitions, bulk rejection with shared reasoning, one-time action constraints
- Applicant detail view: profile, timeline, resume, in-thread messaging, status controls
- **Analytics suite**: conversion funnels, trend charts, filterable by date range/status/type/location
- **CSV export**: RFC 4180-compliant, streamed via cursor-batched queries, 50K row cap
- Real-time, rate-limited direct messaging with applicants
- **App-wide rate limiting** — configurable sliding-window limiter with OpenTelemetry metrics, batched cleanup, per-endpoint fail strategy, and admin metrics endpoint
- Role-aware notifications & activity feed with unread badges

### 👤 Job Seeker (User)

- Rich profile builder: experience, social links, skills, salary expectations
- **In-app resume builder** (structured JSON, not a generic text editor) + file upload (PDF/DOC/DOCX ≤10MB) with automatic file cleanup on delete
- **AI-powered resume enhancement** — multi-provider (Anthropic/OpenAI/Gemini), suggestion-only with per-suggestion copy, ATS scoring, rate-limited to 5/day
- One-click apply with **resume snapshotting** (frozen at apply time, survives resume deletion)
- Application tracking: filterable list, status timeline, withdraw flow, in-thread recruiter messaging
- Bookmark/save jobs with graceful handling of jobs that later go inactive

### 🌍 Public

- Full-text job search with advanced filtering (work mode, employment type, experience, industry)
- **Dual-gate job visibility** — jobs only appear when both recruiter- and admin-level flags allow it
- Job detail pages with view tracking (deduplicated per session), company preview cards, and related content panels (company jobs + similar jobs)
- Animated home page: hero search, category strip, featured jobs/companies, testimonials
- Career resources hub (resume tips, interview checklist, salary FAQ)
- **Dedicated pages**: About, Careers, Contact, Employers, Pricing, Press, Become an Employer
- **SEO-complete**: dynamic `sitemap.xml`, `robots.txt`, and JSON-LD `JobPosting` structured data
- **Social links** in footer (LinkedIn, Twitter/X, GitHub) with `mailto:` fallback to contact email

---

## ⏭️ Strategic Omissions (By Design)

Hire Flow intentionally avoids legacy enterprise bloat to keep infrastructure costs under **$50/month** and the user experience fast.

| Feature                             | Status       | Rationale                                                                                                                                                                                                                             |
| ----------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email forwarding (IMAP/SMTP sync)   | ❌ Not built | Syncing external inboxes requires complex webhooks and \$5/user/month Google API fees. All communication stays native in-app (Pusher real-time), ensuring recruiters never miss context and candidates have a single source of truth. |
| Google / Outlook Calendar sync      | ❌ Not built | Two-way calendar APIs are brittle and require OAuth token refresh cycles. We store `interviewDate` and `meetingLink` as data fields — recruiters paste their own meeting links, keeping scheduling simple and bug-free.               |
| External job board syndication      | ❌ Not built | Posting to LinkedIn / Indeed requires paid API access and strict content policy compliance. Hire Flow is a standalone marketplace — we drive traffic directly to your job posts, not through aggregators.                             |
| OCR for scanned/ handwritten images | ❌ Not built | Text extraction from digital PDFs and DOCX (via `pdf-parse`/`mammoth`) is already wired into the AI enhancement pipeline — scanned image OCR requires a separate ML layer that adds cost for minimal real-world gain.                 |

**The trade-off:** You get ~90% of the value of enterprise ATS tools (Greenhouse, Lever) for ~10% of the operational cost, with zero vendor lock-in.

---

## 🤖 AI-Powered Features

Hire Flow ships a production-grade AI layer that goes beyond a single API call — it's an **architected multi-provider system** built for reliability, cost control, and user experience.

### Multi-Provider Abstraction

A single `AI_PROVIDER` env var (`anthropic` | `openai` | `google`) switches between **Claude**, **GPT**, and **Gemini** under the hood — no code changes, no provider lock-in. If no API key is configured, every AI surface degrades gracefully with a user-facing message rather than crashing the page.

### Resume Enhancement Engine

Job seekers get an interactive AI assistant that:

- **Analyses their resume** against the job market and suggests targeted improvements
- **Scores ATS compatibility** (keyword density, section completeness, formatting)
- **Returns actionable suggestions** with per-suggestion copy, never a blind rewrite
- **Snapshots the resume** at enhancement time so the original is preserved

### Rate-Limited Per-User Quota

Each user gets **5 AI enhancements per day**, enforced by an **atomic PostgreSQL `UPDATE … WHERE used < $3 RETURNING`** query — quota races are impossible even under concurrent requests. The quota survives server restarts (DB-backed, not in-memory).

### Graceful Degradation

Every AI feature checks for key presence at runtime. If no provider key is configured, the UI shows _"AI features temporarily unavailable"_ — the rest of the app works perfectly. This pattern is enforced consistently across resume enhancement, ATS scoring, and any future AI surface.

---

## 🏛️ Architecture & Design Decisions

**Resume Snapshotting** — At the moment a user applies, their resume (file URL or builder JSON) is frozen directly onto the `Application` row. This guarantees recruiters always see exactly what was submitted, even if the source resume is later edited or soft-deleted.

**Unified Status Timeline** — Both the recruiter and applicant surfaces write to a shared `ApplicationStatusChange` table starting from the very first `applied` transition. A single `StatusTimeline` component renders identically on both sides, eliminating duplicated timeline logic and drift.

**Multi-Provider AI Layer** — `lib/ai-client.ts` abstracts over Anthropic, OpenAI, and Google via a single `AI_PROVIDER` env var, with graceful degradation ("AI features temporarily unavailable") if no key is configured — so the app never hard-fails on a missing third-party dependency.

**Generic Rate Limiting** — A unified `lib/rate-limiting/` module provides configurable sliding-window rate limiting across all API routes, with OpenTelemetry metrics, batched cleanup, per-endpoint fail strategy, and an admin metrics endpoint. Wired into 9 production routes via `withRateLimit`.

**Isolated Public Route Group** — The `(public)` route group ships its own navbar/footer shell, kept fully separate from `(auth)` and `(roles)` groups. This avoids double-chrome bugs and lets crawlers hit marketing/job pages without any auth machinery in the render path.

**Dual-Gate Job Visibility** — Every public-facing job query filters on **both** `status: "active"` (recruiter-controlled) **and** `isActive: true` (admin kill-switch). Missing either check would leak archived or platform-deactivated postings — this pattern is enforced consistently across listings, sitemap generation, and featured jobs.

**Cloud Storage Provider Abstraction** — File uploads (resumes, logos) are abstracted behind a provider registry (`lib/upload.ts`). The `UPLOAD_PROVIDER` env var selects between `local` (dev) and `vercel-blob` (production). Both `saveUpload` and `deleteUpload` dispatch to the correct implementation — file cleanup on resume delete or logo change automatically removes the remote file, preventing storage bloat. Switching providers requires no code changes.

**Middleware-Driven Redirects** — Rather than a single "role home" constant scattered across components, redirect logic lives centrally in `proxy.ts` middleware and shared auth hooks, keeping role-based routing consistent and easy to audit.

**Null-Guarded Structured Data** — JSON-LD `JobPosting` markup is injected via Next.js `generateMetadata`, with every field (salary, location, employment type) individually null-checked so no fabricated data ever reaches search engines.

**CI Quality Gates** — A 6-job GitHub Actions workflow enforces typecheck, lint, format, unit/integration/contract tests with coverage, E2E, performance with baseline regression, and mutation testing (currently disabled in CI)\. Vitest v3 global setup returns teardown for perf result publishing. Baseline regression compares PF1–PF5 against `benchmark/baseline.json`; mutation testing (Stryker, currently disabled) uses `vitest-runner` and `break: null` threshold.

---

## 🚦 CI Quality Gates

Hire Flow enforces 6 quality gates in `.github/workflows/test.yml`:

| Gate | Tool | When | Purpose |
| ---- | ---- | ---- | ------- |
| Typecheck | `tsc --noEmit` | Every PR | Fastest gate; catches type errors ESLint misses |
| Lint | ESLint 9 | Every PR | Code quality, unused vars, react-hooks rules |
| Format | Prettier | Every PR | Consistent formatting across 600+ files |
| Tests + Coverage | Vitest (`default` + `dom` + `contract`) | Every PR | Unit, integration, contract tests with coverage ratchet |
| E2E | Playwright | Every PR | Full role-based journeys with real auth |
| Performance | Vitest `perf` + baseline compare | Master push | PF1–PF5 budgets + regression against `benchmark/baseline.json` |
| Mutation | Stryker Mutator | Master push (commented out) | Surviving mutants across `lib/rate-limiting/` � **disabled until Stryker issues are resolved** |

Supporting config: `.prettierrc`, `.prettierignore`, `vitest.config.ts` (4 projects: `default`, `dom`, `contract`, `perf`), `stryker.config.json` (vitest-runner, `break: null`), `scripts/compare-benchmark.ts`, `scripts/update-baseline.ts`, `lib/test/perf-teardown.ts`.

Performance results flow: perf tests call `publishBenchmark()` → vitest v3 `globalSetup` returns `globalTeardown` → `writeBenchmarkResults(sha)` writes `benchmark/results/${sha}.json` → CI `compare-benchmark.ts` reads baseline + results → fails on hard limit or >20% regression.

---

## 📡 Core API Endpoints

All routes use Zod validation, centralized error handling (`lib/api-error.ts`), and `requireRole([...])` guards. Error responses follow `{ error: string, code?: string }`.

### Admin / Super Admin

| Method   | Endpoint                                         | Purpose                                                |
| -------- | ------------------------------------------------ | ------------------------------------------------------ |
| `GET`    | `/api/admin/dashboard`                           | Platform-wide stats (users, jobs, applications)        |
| `GET`    | `/api/admin/users`                               | List users (paginated, filterable)                     |
| `GET`    | `/api/admin/users/[id]`                          | User detail                                            |
| `DELETE` | `/api/admin/users/[id]`                          | Remove user                                            |
| `POST`   | `/api/admin/users/[id]/ban`                      | Ban user + revoke all sessions                         |
| `POST`   | `/api/admin/users/[id]/unban`                    | Unban user                                             |
| `POST`   | `/api/admin/users/[id]/role`                     | Change user role                                       |
| `GET`    | `/api/admin/users/[id]/sessions`                 | List active sessions                                   |
| `DELETE` | `/api/admin/users/[id]/sessions`                 | Revoke all sessions                                    |
| `GET`    | `/api/admin/users/[id]/applications`             | List user's applications                               |
| `GET`    | `/api/admin/jobs`                                | List all jobs (paginated, filterable)                  |
| `DELETE` | `/api/admin/jobs/[id]`                           | Remove job                                             |
| `PATCH`  | `/api/admin/jobs/[id]`                           | Toggle `isActive` kill-switch                          |
| `GET`    | `/api/admin/invite`                              | List pending invites & team members                    |
| `DELETE` | `/api/admin/invite/[id]`                         | Cancel pending invite                                  |
| `POST`   | `/api/admin/invite/accept`                       | Accept invite with token                               |
| `DELETE` | `/api/admin/team/[id]`                           | Remove team member                                     |
| `GET`    | `/api/admin/threads`                             | List message threads                                   |
| `GET`    | `/api/admin/messages/[threadId]`                 | Get thread messages                                    |
| `POST`   | `/api/admin/messages/[threadId]`                 | Send message                                           |
| `DELETE` | `/api/admin/messages/[threadId]`                 | Delete thread                                          |
| `DELETE` | `/api/admin/messages/[threadId]/[messageId]`     | Delete message                                         |
| `GET`    | `/api/admin/messages/search`                     | Search users & recruiters                              |
| `GET`    | `/api/admin/applications/[applicationId]/detail` | Read-only applicant detail (profile, timeline, resume) |

### Recruiter

| Method   | Endpoint                                              | Purpose                                              |
| -------- | ----------------------------------------------------- | ---------------------------------------------------- |
| `GET`    | `/api/recruiter/jobs`                                 | List company jobs (paginated, filterable)            |
| `POST`   | `/api/recruiter/jobs`                                 | Create job posting                                   |
| `GET`    | `/api/recruiter/jobs/[id]`                            | Job detail                                           |
| `PATCH`  | `/api/recruiter/jobs/[id]`                            | Update job fields                                    |
| `DELETE` | `/api/recruiter/jobs/[id]`                            | Soft-delete (active/archived) or hard-delete (draft) |
| `PATCH`  | `/api/recruiter/jobs/[id]/toggle`                     | Toggle status (draft ↔ active ↔ archived)            |
| `GET`    | `/api/recruiter/jobs/[id]/applicants`                 | List applicants (paginated, filterable)              |
| `GET`    | `/api/recruiter/jobs/[id]/analytics`                  | Per-job pipeline funnel & trends                     |
| `GET`    | `/api/recruiter/jobs/[id]/applicants/export`          | Stream RFC 4180 CSV of filtered applicants           |
| `GET`    | `/api/recruiter/applications/[applicationId]/detail`  | Full applicant detail (profile, timeline, resume)    |
| `GET`    | `/api/recruiter/applications/[applicationId]/profile` | Applicant profile for messaging                      |
| `PATCH`  | `/api/recruiter/applications/[applicationId]/status`  | Transition applicant pipeline status                 |
| `POST`   | `/api/recruiter/applications/[applicationId]/revert`  | Revert to previous status from audit trail           |
| `POST`   | `/api/recruiter/applications/bulk/status`             | Atomic bulk status transition                        |
| `GET`    | `/api/recruiter/analytics`                            | Cross-job analytics (date range, filters)            |
| `GET`    | `/api/recruiter/threads`                              | List message threads                                 |
| `GET`    | `/api/recruiter/messages/[threadId]`                  | Get thread messages                                  |
| `POST`   | `/api/recruiter/messages/[threadId]`                  | Send message                                         |
| `DELETE` | `/api/recruiter/messages/[threadId]`                  | Delete thread                                        |
| `DELETE` | `/api/recruiter/messages/[threadId]/[messageId]`      | Delete message                                       |
| `GET`    | `/api/recruiter/messages/search`                      | Search applicants                                    |
| `GET`    | `/api/recruiter/invite`                               | List pending invites                                 |
| `DELETE` | `/api/recruiter/invite/[id]`                          | Cancel pending invite                                |
| `POST`   | `/api/recruiter/invite/accept`                        | Accept invite with token                             |
| `DELETE` | `/api/recruiter/team/[id]`                            | Remove team member                                   |

### Job Seeker (User)

| Method   | Endpoint                              | Purpose                                                |
| -------- | ------------------------------------- | ------------------------------------------------------ |
| `GET`    | `/api/user/profile`                   | Get own profile                                        |
| `GET`    | `/api/user/resumes`                   | List own non-deleted resumes                           |
| `POST`   | `/api/user/resumes`                   | Upload resume (PDF/DOC/DOCX, ≤10MB)                    |
| `PATCH`  | `/api/user/resumes/[id]`              | Set resume as primary                                  |
| `DELETE` | `/api/user/resumes/[id]`              | Soft-delete resume + remove from storage               |
| `PATCH`  | `/api/user/resumes/[id]/builder-data` | Update builder-structured JSON resume                  |
| `POST`   | `/api/user/resumes/[id]/ai-enhance`   | AI resume suggestions (rate-limited, 5/day)            |
| `GET`    | `/api/user/applications`              | List own applications (filterable, searchable)         |
| `GET`    | `/api/user/applications/stats`        | Application counts (total, active, interviews, offers) |
| `GET`    | `/api/user/applications/[id]`         | Application detail with timeline                       |
| `DELETE` | `/api/user/applications/[id]`         | Withdraw (`applied` / `reviewing` only)                |
| `GET`    | `/api/user/bookmarks`                 | List bookmarked jobs                                   |
| `POST`   | `/api/user/bookmarks`                 | Toggle bookmark (create / delete)                      |
| `GET`    | `/api/user/bookmarks/[jobId]`         | Check bookmark status                                  |

### Public

| Method | Endpoint                 | Purpose                                               |
| ------ | ------------------------ | ----------------------------------------------------- |
| `GET`  | `/api/jobs`              | Public job listing (search, filters, pagination)      |
| `GET`  | `/api/jobs/[id]`         | Job detail (JSON-LD enriched)                         |
| `POST` | `/api/jobs/[id]/view`    | Increment view count (rate-limited, session-dedupped) |
| `POST` | `/api/jobs/[id]/apply`   | Submit application (auth required, rate-limited)      |
| `GET`  | `/api/jobs/[id]/related` | Related jobs from same company & similar roles        |

### Shared / Infrastructure

| Method   | Endpoint              | Role          | Purpose                                   |
| -------- | --------------------- | ------------- | ----------------------------------------- |
| `POST`   | `/api/upload`         | authenticated | Upload a file (resume, logo, attachment)  |
| `DELETE` | `/api/upload`         | authenticated | Delete a file by URL or filename          |
| `GET`    | `/api/files/download` | authenticated | Stream file download (auth-guarded proxy) |
| `GET`    | `/api/notifications`  | authenticated | List notifications                        |
| `PATCH`  | `/api/notifications`  | authenticated | Mark notifications as read                |
| `DELETE` | `/api/notifications`  | authenticated | Delete notification                       |
| `POST`   | `/api/pusher/auth`    | authenticated | Pusher private channel authentication     |
| `GET`    | `/api/users/[id]`     | any role      | Resolve user by ID (name, avatar)         |

---

## 📈 Project Scale

- **5 completed phases** (Foundation → Admin → Recruiter → User → Public), fully sequenced and documented
- **3 distinct role-based dashboards** + 1 public marketplace
- **7-stage** applicant status pipeline with full audit trail
- **Cloud storage provider abstraction** (local dev ↔ Vercel Blob production)
- **App-wide rate limiting** — `lib/rate-limiting/` module with config, middleware, rate-limiter, repository, metrics, telemetry, cleanup, request-context; wired into 9 API routes; 7 unit + 3 contract + 6 new rate-limiting tests
- **CI quality gates** — ESLint 9, Prettier, Vitest 4-project config (`default`/`dom`/`contract`/`perf`), Stryker mutation testing (currently disabled), GitHub Actions 6-job workflow
- **700+** TypeScript/React files across API routes, feature modules, shared components, rate-limiting, and test infrastructure
- Real-time messaging across **3 role pairs** (admin↔user, recruiter↔applicant) via Pusher private channels

---

## 🏁 Getting Started

### Prerequisites

- **Node.js 20+**
- **PostgreSQL** database (local or hosted, e.g. Neon/Supabase)
- (Optional) Pusher app credentials for realtime features
- (Optional) An API key from Anthropic, OpenAI, or Google for AI resume suggestions
- (Production) A Vercel Blob `BLOB_READ_WRITE_TOKEN` when using `UPLOAD_PROVIDER=vercel-blob`

### 1. Clone & install

```bash
git clone https://github.com/Mohamedhazeem/hire-flow.git
cd hire-flow-next
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
# App
NODE_ENV=development
ALLOW_SEED=false                          # gate for running the seed script
DATABASE_URL=""                           # PostgreSQL connection string

# Auth (Better Auth)
BETTER_AUTH_SECRET=                       # random secret for session signing
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_TEMP_MAIL_CHECK=false  # block disposable email domains on signup

# OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Transactional Email (Resend)
RESEND_API_KEY=""                         # use onboarding@resend.dev while testing
EMAIL_FROM="HireFlow <onboarding@resend.dev>"

# Bootstrap
PROMOTE_TO_SUPER_ADMINS="admin@hireflow.dev"   # comma-separated emails auto-eligible for promotion

# Realtime (Pusher)
PUSHER_APP_ID=000000
PUSHER_KEY=dummy-key
PUSHER_SECRET=dummy-secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=dummy-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# AI Provider (optional — defaults to 'anthropic')
# Supported values: anthropic | openai | google
AI_PROVIDER=anthropic

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# OpenAI (GPT) — uncomment and fill to use instead
# OPENAI_API_KEY=sk-xxxxxxxxxxxx
# OPENAI_MODEL=gpt-4o

# Google (Gemini) — uncomment and fill to use instead
# GEMINI_API_KEY=xxxxxxxxxxxx
# GEMINI_MODEL=gemini-2.0-flash

# Upload Storage Provider: "local" (dev) or "vercel-blob" (production)
UPLOAD_PROVIDER=local

# Vercel Blob — required when UPLOAD_PROVIDER=vercel-blob
# Get this token from: Vercel Dashboard → Storage → Blob → Tokens
BLOB_READ_WRITE_TOKEN=

# Vercel Blob CDN host — used for image remotePatterns in next.config.ts
NEXT_PUBLIC_BLOB_CDN_HOST=public.blob.vercel-storage.com

# Social links (optional — unset values fall back to mailto:CONTACT_EMAIL)
NEXT_PUBLIC_LINKEDIN_URL=
NEXT_PUBLIC_TWITTER_URL=
NEXT_PUBLIC_GITHUB_URL=
NEXT_PUBLIC_CONTACT_EMAIL=
```

### 3. Set up the database

```bash
npx prisma migrate dev
npm run seed
```

### 4. Promote a super admin

The seed script creates demo users. To promote your own signed-up email to Super Admin, add it to `PROMOTE_TO_SUPER_ADMINS` in `.env` before running:

```bash
npm run promote
```

Use `npm run demote` to revoke super admin status.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign up as a job seeker directly, or promote your account to explore the Admin and Recruiter dashboards.

---

## 📂 Project Structure

```
hire-flow-next/
├── app/
│   ├── (public)/                # Marketing shell: home, jobs, resources, privacy, terms, about, careers, contact, pricing, press, employers, become-employer
│   ├── (auth)/                  # Login, register, verify-email, reset-password, unauthorised, admin-invite, recruiter-invite
│   ├── (roles)/
│   │   ├── admin/                # Admin dashboard, users, jobs, team, messages
│   │   ├── recruiter/            # Recruiter dashboard, jobs, applicants, analytics
│   │   └── user/                 # Job seeker dashboard, profile, resumes, applications
│   ├── api/                      # REST route handlers (admin/recruiter/user/jobs/files)
│   ├── features/                 # Feature-colocated components, hooks, queries, schemas
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── recruiter/
│   │   ├── shared/
│   │   ├── user/
│   │   ├── jobs/
│   │   ├── landing/
│   │   ├── public/
│   │   └── notifications/
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── chat/                    # Chat header, thread list, message input
│   ├── layout/                  # Page header, role layout client
│   ├── shared/                  # StatusTimeline, ConfirmActionButton, AvatarFallback…
│   └── ui/                      # Shared shadcn primitives (button, table, dialog, data-table…)
├── lib/                          # Core utilities
│   ├── api/                     # api-client, api-error, api-response, api-wrapper
│   ├── handlers/                # Message & invite handlers
│   ├── pusher/                  # Pusher server/client setup
│   ├── repositories/            # Application, job, message repositories
│   ├── rate-limiting/           # App-wide rate limiting (config, middleware, limiter, metrics, cleanup)
│   ├── services/                # Application, job, notification services
│   ├── upload.ts                # Provider registry: local + Vercel Blob implementations
│   └── test/                    # Factories, fixtures, mocks, reset-db, perf helpers, teardown
├── stores/                       # Zustand: ui-store, chat-store
├── features/
│   └── messages/                 # Presence store & realtime messaging
├── utils/                        # env, format-string, etc.
├── scripts/                      # promote-super-admin, demote-super-admin, benchmark compare/update
├── e2e/                          # Playwright spec files
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── scripts/
├── proxy.ts                      # Auth & role-redirect middleware
└── manifest.md                   # Living build log & architecture record
```

---

## 🧩 Key Patterns

- **Server Components by default** — client boundaries (`"use client"`) only where interactivity is required
- **REST route handlers for mutations, Server Actions for plain forms** — keeps complex validation/authorization logic out of form submission plumbing
- **Zod everywhere** — every write path runs `schema.safeParse()` before touching the database; errors flow through a centralized `lib/api-error.ts`
- **TanStack Query for server state, Zustand strictly for UI state** — sidebars/modals never touch API data, and vice versa
- **Pusher channel convention** — `private-thread-[id]` for conversations, `private-user-[id]` for personal notifications
- **Prisma singleton + `@prisma/adapter-pg`** — connection reuse across serverless invocations
- **Shared notification utility** — `lib/notifications.ts` performs the DB write and Pusher trigger atomically from a single call site
- **Rate limiting as infrastructure, not an afterthought** — unified `lib/rate-limiting/` module with configurable sliding-window limiter, OpenTelemetry metrics, batched cleanup, per-endpoint fail strategy, and admin metrics endpoint
- **Upload provider abstraction** — `UPLOAD_PROVIDER` env var selects `local` or `vercel-blob`; the provider registry in `lib/upload.ts` dispatches `saveUpload`/`deleteUpload` to the correct implementation with zero code changes when switching
- **CI quality gates as code** — typecheck, lint, format, contract tests, performance baseline regression, and mutation testing (currently disabled) are all defined in `.github/workflows/test.yml` with supporting scripts in `scripts/` and config in `vitest.config.ts`/`stryker.config.json`

---

## ☁️ Deployment

Deployed on **Vercel**.

**Build command** (from `package.json`):

```bash
npx prisma migrate deploy && next build
```

**Required environment variables in production:**
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `PROMOTE_TO_SUPER_ADMINS`, `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`, `AI_PROVIDER`, and the corresponding AI provider key/model (e.g. `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`), `UPLOAD_PROVIDER`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_BLOB_CDN_HOST`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_GITHUB_URL`, and `NEXT_PUBLIC_CONTACT_EMAIL`.

---

## 🧪 Testing

Hire Flow uses a layered testing strategy matched to each layer of the stack:

| Layer       | Tool                                     | What it covers                                                                                                                             |
| ----------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit        | Vitest                                   | Pure logic: rate limiter, CSV builder, pagination, Zod schemas, AI client fallback                                                         |
| Contract    | Vitest (`contract` project)              | Shared behavioral guarantees for repository implementations (fake + Prisma)                                                                |
| Integration | Vitest + local Postgres test DB          | API route handlers called directly, tenant isolation, transactions, audit trails                                                           |
| Performance | Vitest (`perf` project) + local Postgres | Scale budgets: analytics (PF1), applicant listing (PF2), CSV export (PF3), public job FTS search (PF4), resume AI-enhance quota race (PF5) |
| Component   | React Testing Library                    | Data table selection, bulk action logic, forms, AI suggestions panel                                                                       |
| Mutation    | Stryker Mutator + Vitest (disabled)    | Surviving mutants across `lib/rate-limiting/` and shared APIs                                                                             |
| End-to-End  | Playwright                               | Full role-based journeys (anonymous → user → recruiter → admin) with real Better Auth sessions                                             |

External services (Pusher, AI providers, Resend, Vercel Blob) are mocked at the module level — tests never make real network calls or incur API costs.

### Test infrastructure (Phases 0–7)

Tests are built incrementally per the [testing strategy](docs/testing/testing-strategy.md). Suites are colocated next to source as `*.test.ts` (unit), `*.test.ts` (integration, real Postgres), `*.perf.test.ts` (perf project), `*.dom.test.tsx` (component), and `*.contract.test.ts` (contract).

| Phase | Focus                               | Covers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0     | Test infrastructure                 | `vitest.config.ts` (react + tsconfig-paths plugins, `default`/`dom`/`contract`/`perf` projects), `lib/test/test-db.ts` (isolated Prisma client), `lib/test/reset-db.ts` (`RESTART IDENTITY CASCADE` truncation in dependency order), `lib/test/factories.ts` (`createTestUser`/`Company`/`Job`/`Application`/`Resume`/`Thread`), `lib/test/auth-fixtures.ts` (`mockSession`), `lib/test/mocks.ts` (`mockPusherTrigger`/`mockAiClient`/`mockResend`), `global-setup.ts` returns vitest v3 teardown for perf result publishing |
| 1     | Input validation & schema hardening | SQL-injection rejection for raw analytics query params (Zod UUID/ISO dates); edge cases for `profile`/`resume`/`application-submit`/`job`/`auth`/`admin` schemas; mass-assignment (over-posting) prevention on role/patch/apply routes                                                                                                                                                                                                                                                           |
| 2     | Unit tests: pure logic              | `lib/rate-limiter.ts`, `csv-builder.ts` (RFC 4180 escaping), `lib/pagination.ts`, `api-error/api-response`, `lib/routes.ts`, `lib/job-categories.ts`, `rate-limit-message.ts`, `ai-client.ts`; Zod schema tests; `require-role.ts`, `validator.ts`, `presence-store.ts`, `applicant-table-utils.ts`                                                                                                                                                                                              |
| 3     | Auth & authorization                | Session/token security (expired/malformed/missing → 401, cross-role → 403); IDOR protection for every resource (application, job, resume, profile, thread, message, notification, bookmark, admin actions); middleware redirect matrix                                                                                                                                                                                                                                                           |
| 4     | Integration: API routes + real DB   | All 17 priority route groups (tenant isolation, public-job gate, apply, status/bulk/revert, resume CRUD, ai-enhance rate limit, messages, bookmarks, export, ban/sessions, withdraw, files/download, analytics, notifications, role PATCH, upload/download with cloud storage); file upload/download edges with local and Vercel Blob providers, notification delivery, search/FTS sanitization, pagination boundaries, audit-trail integrity, error-shape/info-leak, concurrent race conditions |
| 5     | Component tests (RTL)               | `data-table`, `applicants-table`, `bulk-reject-dialog`, `status-timeline`, `resume-builder-form`, `ai-suggestions-panel`, `job-search-bar`, `save-job-button`, `account-popover`, `apply-modal`, chat components, `no-company-prompt`                                                                                                                                                                                                                                                            |
| 6     | End-to-end (Playwright)             | 10 role-based journeys (anonymous apply redirect, user apply, recruiter pipeline, bulk reject, admin ban, messaging roundtrip, AI enhance, CSV export, cross-role access, IDOR deep links) across anonymous/user/recruiter/admin storage states                                                                                                                                                                                                                                                  |
| 7     | CI quality gates                    | Typecheck (`tsc --noEmit`), ESLint, Prettier format check, contract tests (`*.contract.test.ts`), performance baseline regression (`benchmark/baseline.json` + `compare-benchmark.ts`), mutation testing (Stryker with vitest-runner) � **currently disabled in CI**                                                                                                                                                                                                                                                           |

### Performance & stability tests (Phase 7)

The `perf` Vitest project runs tests matching `*.perf.test.ts` against a **real** Postgres `hireflow_test` database (no data-layer mocks) with a 300s timeout. Helpers live in `lib/test/perf.ts` (`measure`, `assertWithin`, `assertMemoryWithin`, `publishBenchmark`, `writeBenchmarkResults`) and seed factories in `lib/test/factories/seed-factories.ts`. Vitest v3 `globalSetup` returns a teardown function that publishes results to `benchmark/results/${sha}.json`.

| Test    | File                                                              | What it asserts                                                               |
| ------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| PF1     | `app/features/recruiter/queries/analytics-queries.perf.test.ts`   | Analytics aggregation over a large dataset within budget                      |
| PF2     | `app/features/recruiter/queries/application-queries.perf.test.ts` | Applicant listing/pagination at scale                                         |
| PF3     | `app/features/recruiter/queries/export-queries.perf.test.ts`      | CSV export throughput                                                         |
| PF4     | `app/features/jobs/queries/public-job-queries.perf.test.ts`       | Public job FTS search (`search:"engineer"`) ≤ 1000ms using GIN indexes        |
| PF5     | `app/api/user/resumes/[id]/ai-enhance/route.perf.test.ts`         | Atomic daily quota (limit 5) survives concurrent requests — exactly 5 succeed |
| RL1–RL5 | `lib/test/unit/rate-limit.test.ts`                                | Rate limiter: restart persistence, concurrent windows, `max:0` guard, etc.    |

Supporting infra: `Application` indexes (`@@index([appliedAt])`, `@@index([jobId, appliedAt])`) and GIN FTS indexes on `Job.title`/`Job.description`; a `ResumeEnhancementQuota` table backing PF5's atomic `UPDATE … WHERE used < $3 RETURNING`.

### Contract tests (Phase 7)

The `contract` Vitest project runs `*.contract.test.ts` files to enforce shared behavioral guarantees across implementation variants:

| Test     | File                                                              | What it asserts                                                               |
| -------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Repo     | `lib/test/unit/rate-limiting/contract/repository-contract.ts`     | FakeRepository and PrismaRateLimitRepository behave identically               |
| Prisma   | `lib/test/unit/rate-limiting/repository.prisma.contract.test.ts`  | Prisma-backed repository satisfies the contract against a real Postgres DB     |

### Mutation testing (Phase 7)

Stryker Mutator (currently disabled) runs on master push using `vitest-runner` against the `default` and `contract` projects. Thresholds: `high: 80`, `low: 60`, `break: null`. Mutants are generated from `lib/rate-limiting/**/*.ts` excluding tests, types, config, and metrics. Reports are written to `reports/mutation/`.

### Running tests

`vitest.config.ts` defines four projects: `default` (30s timeout — unit + integration), `dom` (5s timeout — component/RTL tests), `contract` (5s timeout — `*.contract.test.ts`), and `perf` (300s timeout — `*.perf.test.ts` against a real Postgres test DB). By default `npm run test` runs all three; use `--project` to target a specific one.

```bash
# One-time: create local test database
createdb hireflow_test

# Add to .env.test
DATABASE_URL_TEST="postgresql://<user>:<password>@localhost:5432/hireflow_test"

# All projects (default + dom + contract + perf)
npm run test
npm run test:watch
npm run test:coverage

# Component/DOM tests only
npx vitest run --project dom

# Contract tests only
npx vitest run --project contract

# Performance/safety project only (real Postgres, long timeout)
npx vitest run --project perf

# Specific combination
npx vitest run --project default --project perf

# Apply migrations to the test database before the first run (global-setup also does this)
npx prisma migrate deploy --schema prisma/schema.prisma

# End-to-end (spins up a production build automatically)
npm run test:e2e
npm run test:e2e:ui   # interactive mode
```

CI quality gates are defined in `.github/workflows/test.yml`: typecheck, lint, format check, unit/integration/contract with coverage, E2E, performance with baseline regression (`scripts/compare-benchmark.ts`). Mutation testing (Stryker) is currently disabled in CI. Performance results are published to `benchmark/results/${sha}.json` by `lib/test/perf-teardown.ts` via vitest v3 global setup teardown.

Coverage thresholds are enforced via `vitest.config.ts` (currently `lines: 22, functions: 54, statements: 22, branches: 67`) and ratchet upward as suites mature.

---

## 📄 License

This project is licensed under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)](LICENSE).

- **View and Study** — free to use for personal learning, education, and non-commercial portfolio reference.
- **Attribution** — you must give appropriate credit to **Mohamed Hazeem**, provide a link to the original repository, and indicate if changes were made.
- **NonCommercial** — you may not use the material for commercial purposes.
- **NoDerivatives** — you may not distribute modified versions of the material.
- **No Misattribution** — you must not claim authorship of the original work or represent modified material as the original creation of Mohamed Hazeem.

For commercial licensing inquiries, contact [a.mohamedhazeem@gmail.com](mailto:a.mohamedhazeem@gmail.com).

## 📬 Contact

Built by **Mohamed Hazeem** — reach out via [a.mohamedhazeem@gmail.com](mailto:a.mohamedhazeem@gmail.com) or [GitHub](https://github.com/Mohamedhazeem).
