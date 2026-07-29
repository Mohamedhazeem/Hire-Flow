# Technical Design

## Technology Stack

| Layer              | Technology                      | Version           |
| ------------------ | ------------------------------- | ----------------- |
| Framework          | Next.js (App Router, Turbopack) | 16.2.7            |
| UI Library         | React                           | 19.2.4            |
| Language           | TypeScript                      | 5.x (strict mode) |
| Styling            | Tailwind CSS                    | v4                |
| Component Library  | Shadcn UI                       | 4.11.0            |
| Database           | PostgreSQL + Prisma             | 7.8.0             |
| Authentication     | Better Auth + Prisma Adapter    | 1.6.15            |
| Server State       | TanStack Query                  | 5.101.0           |
| Client State       | Zustand                         | 5.0.14            |
| Forms              | React Hook Form + Zod           | 7.78.0 / 4.4.3    |
| Animations         | Motion (formerly Framer Motion) | 12.40.0           |
| Charts             | Recharts                        | 3.8.1             |
| Icons              | Lucide React / React Icons      | 1.18.0 / 5.6.0    |
| Real-time          | Pusher                          | 5.3.4             |
| Email              | Resend + React Email            | 6.12.4 / 6.6.1    |
| Date Handling      | date-fns                        | 4.4.0             |
| PDF Processing     | pdf-parse, mammoth, react-pdf   | —                 |
| Runtime Validation | Zod v4                          | 4.4.3             |

## Project Structure

```
hire-flow-next/
  app/
    (auth)/               # Login, register, password reset, verify-email, invite-accept
    (public)/             # Home page, job listings, job details, privacy, terms
    (resources)/          # Career resources pages
    (roles)/
      admin/              # Admin dashboard, users, recruiters, jobs, team, messages
      recruiter/          # Recruiter dashboard, company, team, jobs, applicants, analytics, messages
      user/               # User profile, resumes, applications, saved jobs, messages
    api/                  # REST API route handlers
    features/             # Feature-based modules (see below)
    generated/prisma/     # Custom Prisma client output directory
  components/
    ui/                   # Shadcn-based UI primitives (button, input, badge, table, etc.)
    shared/               # Cross-role reusable components (status-timeline, avatar-fallback, etc.)
    layout/               # Layout components (page-header, sidebar, role-layout-client)
    chat/                 # Chat/messaging shared components
  features/
    messages/stores/      # Shared messaging presence store
    shared/api/           # requireRole guard
  lib/                    # Shared utilities
  stores/                 # Zustand client-state stores
  utils/                  # General utilities (env, logger, formatting)
  prisma/                 # Schema, migrations, seed script
  scripts/                # Admin promotion/demotion scripts
  public/                 # Static assets
```

## Feature-Based Modules

Each feature module under `app/features/` follows this convention:

```
features/<name>/
  actions/          # Server Actions ('use server')
  components/       # React components (server + client)
    charts/         # Chart components
    filters/        # Filter components
    email/          # React Email templates
  hooks/            # TanStack Query hooks, custom hooks
    messages/       # Messaging-specific hooks
  libs/             # Feature-specific libraries
  queries/          # Prisma query functions (server-only)
  schema/           # Zod validation schemas
```

### Feature Modules

| Module          | Purpose                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| `admin`         | Admin dashboard, user/recruiter management, team invites, job oversight, messaging |
| `auth`          | Authentication forms, server actions, session utilities, RBAC                      |
| `jobs`          | Public job listings, job cards, search, filters, apply flow                        |
| `landing`       | Home page sections (hero, featured jobs, testimonials, footer)                     |
| `notifications` | Notification dropdown, activity feed page, hooks                                   |
| `public`        | Public navbar, account popover, career resources, featured companies               |
| `recruiter`     | Company management, job CRUD, applicant pipeline, analytics, export                |
| `user`          | Profile, resumes, AI enhancement, applications, saved jobs                         |

## Authentication

Better Auth v1.6 with Prisma adapter handles all authentication. Configuration is in `app/features/auth/libs/auth.ts`. The system supports:

- Email/password registration with email verification
- Social sign-in (OAuth providers)
- Password reset flow
- Session management via database

The `User.role` field drives authorization. Roles: `user`, `recruiter`, `admin`, `super_admin`.

## Authorization & Middleware

### Proxy Middleware (`proxy.ts`)

The proxy middleware enforces three tiers of access control:

1. **Authenticated users** on auth pages (`/login`, `/register`, etc.) or root `/` are redirected to their role-specific landing page (except `/verify-email`).
2. **Unauthenticated users** on protected routes (`/admin`, `/recruiter`, `/user`) are redirected to `/login`.
3. **Non-admin users** accessing `/admin/*` are redirected to `/unauthorized`.

Route categories are defined in `lib/routes.ts`:

- `AUTH_PAGES`: login, register, reset-password, verify-email
- `PROTECTED_ROUTES`: admin, recruiter, user
- `PUBLIC_CONTENT_PATHS`: /, /jobs, /resources, /privacy, /terms, /unauthorized
- `ADDITIONAL_HIDDEN_PREFIXES`: admin-invite, recruiter-invite

### Role Guard (`requireRole`)

The `requireRole(allowedRoles)` function in `app/features/shared/api/require-role.ts` is the canonical authorization gate for all protected Server Actions and API Routes. It:

1. Retrieves the current session via Better Auth
2. Validates the user's role against `allowedRoles`
3. For `recruiter` role, resolves `companyId` and `memberRole` from `CompanyTeamMember`
4. Throws `UnauthorizedError` (401) or `ForbiddenError` (403) as appropriate

All protected routes must call this guard as their first operation.

### Route-Level Protection

Layout files in `app/(roles)/` provide an additional layer of protection by requiring a session for rendering. The `(public)` route group has no authentication requirements.

## API Conventions

### Route Handlers

API routes use Next.js App Router Route Handlers under `app/api/`. Handlers are wrapped with `withErrorHandler()` from `lib/api-wrapper.ts` for consistent error handling.

### Error Handling

Custom error classes in `lib/api-error.ts` map to HTTP status codes:

| Error Class            | HTTP Status                |
| ---------------------- | -------------------------- |
| `UnauthorizedError`    | 401                        |
| `ForbiddenError`       | 403                        |
| `NotFoundError`        | 404                        |
| `ValidationError`      | 400                        |
| `ConflictError`        | 409                        |
| `TooManyRequestsError` | 429                        |
| `ApiError`             | dynamic (explicit status)  |
| `ZodError`             | 422 (unprocessable entity) |

The `api-wrapper.ts` catches these errors and returns structured JSON responses.

### Response Format

All API responses use the `ok()` / `fail()` helpers from `lib/api-response.ts`:

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```

Validation failures include a `details` field with Zod-flattened field errors.

### Page Protection

Each role's API routes enforce authorization:

- **Admin routes**: `requireRole(["admin", "super_admin"])`
- **Recruiter routes**: `requireRole(["recruiter"])` with tenant isolation via `companyId`
- **User routes**: `requireRole(["user"])` with `userId`-scoped data access
- **Public routes**: No guard, but may apply rate limiting and dual-gate job visibility filters

## Validation

Zod v4 is used for all input validation. Every mutation endpoint calls `schema.safeParse()` before writing to the database. A shared `validateWithZod()` utility in `lib/validator.ts` wraps this pattern.

Key schemas:

- `admin.schema.ts` — Admin query params, invite, ban, role management
- `auth.schema.ts` — Login, registration, password reset
- `company.schema.ts` — Company profile CRUD
- `job.schema.ts` — Job creation, updates, listing filters
- `application.schema.ts` — Bulk status transitions, application queries
- `analytics.schema.ts` — Date range filters, chart config
- `profile.schema.ts` — User profile (skills ≤50, experiences ≤20, socialLinks ≤10)
- `resume.schema.ts` — Resume builder data
- `resume-ai.schema.ts` — AI suggestions and enhancement
- `application-submit.schema.ts` — Job application submission (coverLetter ≤5000)
- `notification.schema.ts` — Notification query params

## Prisma Schema & Database

Generated client output is at `app/generated/prisma/` (custom path via `prisma.config.ts`). Full-text search is enabled via `fullTextSearchPostgres` preview feature.

### Core Models

| Model                     | Description                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `User`                    | Better Auth core user with `role`, `banned`, `banReason`, `banExpiresAt`            |
| `UserProfile`             | Extended profile: headline, bio, skills, experience, salary, social links           |
| `Resume`                  | File uploads or builder-created JSON, soft-delete via `deletedAt`, per-user primary |
| `Company`                 | Recruiter-owned company with industry, website, social links                        |
| `CompanyTeamMember`       | Memberships linking users to companies with a role                                  |
| `RecruiterInvite`         | Email-based invites with token, accepted tracking                                   |
| `AdminInvite`             | Admin team invites with token, accepted tracking                                    |
| `Job`                     | Job postings with dual visibility: recruiter `status` + admin `isActive` toggle     |
| `Application`             | User applications with status, resume snapshot, rejection reason, interview details |
| `ApplicationStatusChange` | Audit trail of every status transition (fromStatus → toStatus)                      |
| `Message`                 | Threaded messages with file attachments, read status                                |
| `Notification`            | In-app notifications with type discriminator and JSON data                          |
| `Bookmark`                | User job bookmarks with `@@unique([userId, jobId])`                                 |
| `ResumeEnhancementLog`    | Rate-limit counter for AI resume enhancement (5/day per user)                       |

### Enums

- `Role`: user, recruiter, admin, super_admin
- `WorkMode`: remote, hybrid, onsite
- `EmploymentType`: full_time, part_time, contract, internship, freelance
- `NotificationType`: application_status, new_message, profile_viewed, ban_status

## Data Fetching & State Management

### TanStack Query (Server State)

All client-side data fetching uses TanStack Query. A singleton `QueryClient` with default options is configured in `lib/query-client.ts`. Hooks follow the `use<ResourceName>` naming convention and are colocated in feature-specific `hooks/` directories.

### Zustand (Client State)

Zustand manages UI-only client state:

- `stores/ui-store.ts` — Sidebar toggle, theme preference (persisted)
- `stores/chat-store.ts` — Active thread, unread message counts

Zustand is never used for API data — that is TanStack Query's domain.

### Prisma Queries (Server-Only)

Server-side database operations are in feature-specific `queries/` directories. These functions import from `lib/prisma.ts` (singleton) and are called from Server Components or API Route Handlers. They never run on the client.

## Real-time Communication

### Pusher

Pusher provides real-time messaging and notifications:

- **Message channels**: `private-thread-{threadId}` for messages, `private-user-{userId}` for notifications
- **Auth endpoint**: `app/api/pusher/auth/route.ts`
- **Server**: `lib/pusher.ts` (no-op fallback when unconfigured)
- **Client**: `lib/pusher-client.ts`
- **Thread presence**: `features/messages/stores/use-thread-presence.ts`

### Notifications

The shared `lib/notifications.ts` utility provides:

- `createNotification(userId, type, data)` — DB insert + Pusher trigger
- `createNotificationsBulk(items)` — Batch notifications for bulk operations
- `triggerForCompany(companyId, ...)` — Notify all company team members

All status changes, messages, and bulk actions use this utility.

## Resume Snapshot Architecture

At application time, the user's current resume is frozen into the `Application` record:

- `resumeSnapshotUrl` — File ID for file-uploaded resumes
- `resumeSnapshotBuilderData` — JSON payload for builder-created resumes

This survives resume soft-deletion. Recruiters and applicants always see the submitted version.

## Job Visibility (Dual-Gate)

Jobs are visible through two independent gates that must both pass:

1. **Recruiter-controlled**: `Job.status === "active"` (draft/archived not visible)
2. **Admin kill-switch**: `Job.isActive === true` (admin can deactivate any job)

This filter is applied in: `listPublicJobs()`, featured jobs queries, sitemap dynamic entries.

## Rate Limiting

`lib/rate-limiter.ts` provides an in-memory sliding-window rate limiter with periodic cleanup (10 minutes):

| Endpoint              | Limit | Window                                         |
| --------------------- | ----- | ---------------------------------------------- |
| Job apply             | 10    | per minute                                     |
| Job view tracking     | 100   | per minute                                     |
| AI resume enhancement | 5     | per day (DB-backed via `ResumeEnhancementLog`) |
| Recruiter messages    | 20    | per hour per pair                              |

AI rate limiting uses the `ResumeEnhancementLog` database table for persistence across server restarts and instances.

## File Upload

`app/api/upload/route.ts` handles file uploads. The current implementation is a mock provider (local file storage). Production deployment requires replacement with S3 or Vercel Blob.

File downloads are proxied through `app/api/files/download/route.ts` with authorization checks:

- File owner can download their own files
- Recruiters with an active relationship to the applicant can download
- Admins can download any file
- Unrelated/unauthorized requests receive 403

## SEO & Structured Data

- **Sitemap**: `app/sitemap.ts` — Static entries (/, /jobs, /resources, /privacy, /terms) + dynamic job entries with dual-gate filter
- **Robots**: `app/robots.ts` — Disallow /admin, /recruiter, /user, /api; allow everything else
- **JSON-LD**: Injected via Next.js `generateMetadata` `other` object for job detail pages with null-guarded fields

## AI Integration

`lib/ai-client.ts` provides a multi-provider AI abstraction supporting:

| Provider  | Model (default)          | Env Variable        |
| --------- | ------------------------ | ------------------- |
| Anthropic | claude-sonnet-4-20250514 | `ANTHROPIC_API_KEY` |
| OpenAI    | gpt-4o                   | `OPENAI_API_KEY`    |
| Google    | gemini-2.0-flash         | `GEMINI_API_KEY`    |

Provider selection via `AI_PROVIDER` env variable. Returns `null` gracefully when no API key is configured.

## Shared UI Components

### UI Primitives (`components/ui/`)

Button, Input, Badge, Table, Select, Popover, Textarea, Dialog, Checkbox, Skeleton, DateRangePicker, DataTable, StatusBadge, StatCard, ThemeToggle, ThemeInitializer

### Shared Components (`components/shared/`)

StatusTimeline, AvatarFallback, CompanyPreviewCard, ConfirmActionButton, ConfirmDialog, ErrorPage, InfoRow, BackButton, ApplicantProfileCard, ApplicantResumeCard, ResumePreviewDialog, RecentMessagesCard, StartConversationSearch

### Layout Components (`components/layout/`)

PageHeader, Sidebar, RoleLayoutClient, MobileMenuButton

### Chat Components (`components/chat/`)

ChatHeader, ChatInputArea, ChatMessageList, MessageBubble, MessageItem, MessagesPageLayout, SharedThreadView, ThreadListItem, usePusherThread, useThreadView

## Naming Conventions

- **Files**: kebab-case (`resume-builder-form.tsx`, `public-job-queries.ts`)
- **Components**: PascalCase (`ResumeBuilderForm`, `PublicNavbar`)
- **Functions**: camelCase (`listPublicJobs`, `getRedirectPath`)
- **Hooks**: `use` prefix (`useResumes`, `useApplicantDetail`)
- **Schema files**: `*.schema.ts` (Zod schemas)
- **Test files**: `*.test.ts` (unit/integration), `*.dom.test.tsx` (component tests in jsdom)

## Coding Standards

- **Strict TypeScript**: No `any`; use `unknown` + Zod for external data; `import type` for type-only imports
- **Server Components by default**: Add `'use client'` only when needed (hooks, events, browser APIs)
- **params/searchParams are Promises**: Always `await` them (Next.js 16)
- **Zod before DB**: `schema.safeParse()` before every write
- **Prisma singleton**: Import from `lib/prisma.ts` only
- **No secrets in source**: Values in `.env.local`, names only in `.env.example`

## CSS & Theming

Tailwind v4 with `@theme` directives in `globals.css`. No `tailwind.config.ts`. Theme variables support light/dark/system modes. Shadcn components are themed via CSS variables. Animations use Motion for complex sequences (< 300ms durations).
