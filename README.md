````markdown
# 🚀 Hire Flow Next

### A full-stack, multi-tenant hiring platform built for scale

Hire Flow Next is a production-grade job board and applicant tracking system (ATS) supporting three distinct user roles — **Admins**, **Recruiters**, and **Job Seekers** — with real-time messaging, AI-powered resume assistance, and a public-facing job marketplace with SEO built in from the ground up.

Built with **Next.js 16**, **React 19**, **Prisma 7**, and **Better Auth**, this project demonstrates end-to-end product thinking: tenant isolation, rate limiting, optimistic concurrency, audit trails, and agent-assisted development workflows.

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
| Forms           | React Hook Form (+ Hookform Resolvers) | `^7.78.0`                        |
| Realtime        | Pusher / pusher-js                     | `^5.3.4` / `^8.5.0`              |
| Email           | Resend + React Email                   | `^6.12.4` / `^6.6.1`             |
| Charts          | Recharts                               | `^3.8.1`                         |
| Animation       | Motion                                 | `^12.40.0`                       |
| PDF/DOC Parsing | `pdf-parse`, `mammoth`, `react-pdf`    | `^2.4.5` / `^1.12.0` / `^10.4.1` |
| Styling         | Tailwind CSS v4 + shadcn               | `^4` / `^4.11.0`                 |
| Date Handling   | date-fns                               | `^4.4.0`                         |
| Tooling         | ESLint 9, tsx, cross-env               | —                                |

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

- Company profile CRUD + team invite management
- Full job posting lifecycle (draft → active → archived)
- **7-status applicant pipeline** with optimistic concurrency control
- **Bulk actions**: mass status transitions, bulk rejection with shared reasoning, one-time action constraints
- Applicant detail view: profile, timeline, resume, in-thread messaging, status controls
- **Analytics suite**: conversion funnels, trend charts, filterable by date range/status/type/location
- **CSV export**: RFC 4180-compliant, streamed via cursor-batched queries, 50K row cap
- Real-time, rate-limited direct messaging with applicants
- Role-aware notifications & activity feed with unread badges

### 👤 Job Seeker (User)

- Rich profile builder: experience, social links, skills, salary expectations
- **In-app resume builder** (structured JSON, not a generic text editor) + file upload (PDF/DOC/DOCX ≤10MB)
- **AI-powered resume enhancement** — multi-provider (Anthropic/OpenAI/Gemini), suggestion-only output with per-item apply/copy, ATS scoring, rate-limited to 5/day
- One-click apply with **resume snapshotting** (frozen at apply time, survives resume deletion)
- Application tracking: filterable list, status timeline, withdraw flow, in-thread recruiter messaging
- Bookmark/save jobs with graceful handling of jobs that later go inactive

### 🌍 Public

- Full-text job search with advanced filtering (work mode, employment type, experience, industry)
- **Dual-gate job visibility** — jobs only appear when both recruiter- and admin-level flags allow it
- Job detail pages with view tracking (deduplicated per session) and company preview cards
- Animated home page: hero search, category strip, featured jobs/companies, testimonials
- Career resources hub (resume tips, interview checklist, salary FAQ)
- **SEO-complete**: dynamic `sitemap.xml`, `robots.txt`, and JSON-LD `JobPosting` structured data

---

## 🏛️ Architecture & Design Decisions

**Resume Snapshotting** — At the moment a user applies, their resume (file URL or builder JSON) is frozen directly onto the `Application` row. This guarantees recruiters always see exactly what was submitted, even if the source resume is later edited or soft-deleted.

**Unified Status Timeline** — Both the recruiter and applicant surfaces write to a shared `ApplicationStatusChange` table starting from the very first `applied` transition. A single `StatusTimeline` component renders identically on both sides, eliminating duplicated timeline logic and drift.

**Multi-Provider AI Layer** — `lib/ai-client.ts` abstracts over Anthropic, OpenAI, and Google via a single `AI_PROVIDER` env var, with graceful degradation ("AI features temporarily unavailable") if no key is configured — so the app never hard-fails on a missing third-party dependency.

**Generic Rate Limiting** — A single in-memory sliding-window limiter (`lib/rate-limiter.ts`) backs both the apply endpoint (10/min) and job view tracking (100/min), with periodic cleanup to avoid memory growth. AI enhancement uses a persisted DB-backed limiter (`ResumeEnhancementLog`) since it must survive server restarts.

**Isolated Public Route Group** — The `(public)` route group ships its own navbar/footer shell, kept fully separate from `(auth)` and `(roles)` groups. This avoids double-chrome bugs and lets crawlers hit marketing/job pages without any auth machinery in the render path.

**Dual-Gate Job Visibility** — Every public-facing job query filters on **both** `status: "active"` (recruiter-controlled) **and** `isActive: true` (admin kill-switch). Missing either check would leak archived or platform-deactivated postings — this pattern is enforced consistently across listings, sitemap generation, and featured jobs.

**Middleware-Driven Redirects** — Rather than a single "role home" constant scattered across components, redirect logic lives centrally in `proxy.ts` middleware and shared auth hooks, keeping role-based routing consistent and easy to audit.

**Null-Guarded Structured Data** — JSON-LD `JobPosting` markup is injected via Next.js `generateMetadata`, with every field (salary, location, employment type) individually null-checked so no fabricated data ever reaches search engines.

---

## 📈 Project Scale

- **4 completed phases** (Admin → Recruiter → User → Public), fully sequenced and documented
- **3 distinct role-based dashboards** + 1 public marketplace
- **7-stage** applicant status pipeline with full audit trail
- **~150+ files** across API routes, feature modules, and shared components
- Real-time messaging across **3 role pairs** (admin↔user, recruiter↔applicant) via Pusher private channels

---

## 🏁 Getting Started

### Prerequisites

- **Node.js 20+**
- **PostgreSQL** database (local or hosted, e.g. Neon/Supabase)
- (Optional) Pusher app credentials for realtime features
- (Optional) An API key from Anthropic, OpenAI, or Google for AI resume suggestions

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/hire-flow-next.git
cd hire-flow-next
npm install
```
````

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
```

### 3. Set up the database

```bash
npx prisma migrate dev
npm run seed
```

### 4. Promote a super admin

The seed script (or your own signup) creates a regular user. To grant admin privileges to any email listed in `PROMOTE_TO_SUPER_ADMINS`:

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
│   ├── (public)/                # Marketing shell: home, jobs, job detail, privacy, terms
│   ├── (auth)/                  # Login, register, verify-email, reset-password
│   ├── (roles)/
│   │   ├── admin/                # Admin dashboard, users, jobs, team, messages
│   │   ├── recruiter/            # Recruiter dashboard, jobs, applicants, analytics
│   │   └── user/                 # Job seeker dashboard, profile, resumes, applications
│   ├── (resources)/              # Career resources hub
│   ├── api/                      # REST route handlers (admin/recruiter/user/jobs/files)
│   ├── features/                 # Feature-colocated components, hooks, queries, schemas
│   │   ├── admin/
│   │   ├── recruiter/
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
│   ├── ui/                      # Shared shadcn primitives (button, table, dialog, data-table…)
│   ├── layout/                  # Page header, role layout client
│   └── shared/                  # StatusTimeline, ConfirmActionButton, AvatarFallback…
├── lib/                          # api-response, api-error, rate-limiter, notifications, ai-client, routes
├── stores/                       # Zustand: ui-store, chat-store
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── scripts/
├── proxy.ts                      # Auth & role-redirect middleware
└── MANIFEST.md                   # Living build log & architecture record
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
- **Rate limiting as infrastructure, not an afterthought** — generic sliding-window limiter reused across apply/view/AI endpoints

---

## ☁️ Deployment

Deployed on **Vercel**.

**Build command** (from `package.json`):

```bash
npx prisma migrate deploy && next build
```

**Required environment variables in production:**
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `PROMOTE_TO_SUPER_ADMINS`, `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`, `AI_PROVIDER`, and the corresponding AI provider key/model (e.g. `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`)..

---

## 🧪 Testing

Hire Flow Next uses a layered testing strategy matched to each layer of the stack:

| Layer       | Tool                            | What it covers                                                                                 |
| ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Unit        | Vitest                          | Pure logic: rate limiter, CSV builder, pagination, Zod schemas, AI client fallback             |
| Integration | Vitest + local Postgres test DB | API route handlers called directly, tenant isolation, transactions, audit trails               |
| Component   | React Testing Library           | Data table selection, bulk action logic, forms, AI suggestions panel                           |
| End-to-End  | Playwright                      | Full role-based journeys (anonymous → user → recruiter → admin) with real Better Auth sessions |

External services (Pusher, AI providers, Resend) are mocked at the module level — tests never make real network calls or incur API costs.

### Running tests

```bash
# One-time: create local test database
createdb hireflow_test

# Add to .env.test
DATABASE_URL_TEST="postgresql://<user>:<password>@localhost:5432/hireflow_test"

# Unit + integration + component tests
npm run test
npm run test:watch
npm run test:coverage

# End-to-end (spins up a production build automatically)
npm run test:e2e
npm run test:e2e:ui   # interactive mode
```

Coverage thresholds are enforced via `vitest.config.ts` and ratchet upward as suites mature. CI runs the full unit/integration suite against a Postgres service container on every pull request, with Playwright E2E running as a separate job.

---

## 📄 License

This project is available under the [MIT License](LICENSE).

## 📬 Contact

Built by **Mohamed Hazeem** — reach out via [a.mohamedhazeem@gmail.com](mailto:a.mohamedhazeem@gmail.com) or [GitHub](https://github.com/Mohamedhazeem).

```

```
