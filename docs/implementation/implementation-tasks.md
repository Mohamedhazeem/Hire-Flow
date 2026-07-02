# Implementation Tasks

Each task below represents an atomic unit of implementation work, preserving the original phase and step hierarchy. Task IDs map directly to the original development phases and steps.

---

## Phase 0: Foundation

### TASK-0.0.1 — Project Initialisation & Dependencies
- **Goal:** Scaffold Next.js 16 App Router project with all required dependencies
- **Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- **Approach:** Install Next.js 16, React 19, TypeScript 5, Tailwind v4, Shadcn UI, Prisma, Better Auth, TanStack Query, Zustand, RHF, Zod v4, Motion, Recharts, Pusher, Resend
- **Completion:** `npm run dev` starts successfully

### TASK-0.1.1 — Prisma Schema
- **Goal:** Define complete database schema with all models, enums, and relationships
- **Files:** `prisma/schema.prisma`, `prisma.config.ts`
- **Approach:** Define Better Auth models (User, Session, Account, Verification) plus platform models (UserProfile, Resume, Company, CompanyTeamMember, RecruiterInvite, Job, Application, ApplicationStatusChange, Message, Notification, Bookmark, ResumeEnhancementLog, AdminInvite). Enable full-text search via `fullTextSearchPostgres`. Custom client output to `app/generated/prisma/`.
- **Dependencies:** PostgreSQL database
- **Completion:** `npx prisma generate` succeeds; migration can be applied

### TASK-0.2.1 — Proxy Middleware
- **Goal:** Implement route protection middleware for authentication and role-based access
- **Files:** `proxy.ts`, `lib/routes.ts`
- **Approach:** Use Better Auth session retrieval. Apply four rules: (1) signed-in users redirected from auth pages/root to role home, (2) unauthenticated users redirected from protected routes to login, (3) non-admin users redirected from admin routes to unauthorized, (4) everything else passes through. Matcher config covers all protected and auth paths.
- **Dependencies:** Better Auth, `app/features/auth/utils/getRedirectPath`
- **Completion:** Middleware redirects correctly for all role/path combinations

### TASK-0.2.2 — Shared Route Constants
- **Goal:** Define canonical route lists for middleware and navbar logic
- **Files:** `lib/routes.ts`
- **Approach:** Export `AUTH_PAGES`, `PROTECTED_ROUTES`, `PUBLIC_CONTENT_PATHS`, `ADDITIONAL_HIDDEN_PREFIXES`, and `isHiddenRoute()` function for PublicNavbar visibility decisions.
- **Completion:** All route constants available; `isHiddenRoute` returns correct results

### TASK-0.3.1 — Shared UI Primitives
- **Goal:** Build Shadcn-based reusable UI component library
- **Files:** `components/ui/button.tsx`, `input.tsx`, `badge.tsx`, `table.tsx`, `select.tsx`, `popover.tsx`, `textarea.tsx`, `dialog.tsx`, `data-table.tsx`, `status-badge.tsx`, `checkbox.tsx`, `skeleton.tsx`, `stat-card.tsx`, `date-range-picker.tsx`, `theme-toggle.tsx`, `theme-initializer.tsx`
- **Approach:** Shadcn conventions with Tailwind v4, CVA for variants. DataTable supports selection, pagination, sorting, filtering, and disabled rows.
- **Completion:** All components render in light/dark/system themes

### TASK-0.3.2 — Shared Layout Components
- **Goal:** Create reusable layout shell components
- **Files:** `components/layout/page-header.tsx`, `sidebar.tsx`, `role-layout-client.tsx`, `mobile-menu-button.tsx`
- **Approach:** PageHeader for consistent page titles with actions. Sidebar for navigation. RoleLayoutClient wraps role layouts with sidebar, theme, and notification structure.
- **Completion:** Layout components used across all role dashboards

### TASK-0.3.3 — Shared Utility Components
- **Goal:** Create cross-feature reusable components
- **Files:** `components/shared/back-button.tsx`, `error-page.tsx`, `confirm-action-button.tsx`, `confirm-dialog.tsx`, `info-row.tsx`, `status-timeline.tsx`, `avatar-fallback.tsx`, `company-preview-card.tsx`, `applicant-profile-card.tsx`, `applicant-resume-card.tsx`, `resume-preview-dialog.tsx`, `recent-messages-card.tsx`, `start-conversation-search.tsx`
- **Approach:** Generic, role-agnostic components. StatusTimeline renders vertical timeline from `ApplicationStatusChange[]`. CompanyPreviewCard used by job details and featured companies.
- **Completion:** Components reused across admin, recruiter, and user features

### TASK-0.4.1 — Mock File Upload Provider
- **Goal:** Implement file upload API endpoint for development
- **Files:** `app/api/upload/route.ts`, `lib/upload.ts`
- **Approach:** Mock provider stores files locally; production requires S3/Vercel Blob replacement.

### TASK-0.5.1 — Database Seed Script
- **Goal:** Populate development database with test data
- **Files:** `prisma/seed.ts`
- **Approach:** Create test users for all roles, companies, jobs, applications, and related data. Use `tsx` as the seed runner.
- **Completion:** `npm run seed` creates realistic test data

### TASK-0.6.1 — TanStack Query Provider
- **Goal:** Configure QueryClientProvider for server-state management
- **Files:** `lib/query-client.ts`, `app/providers.tsx`, `app/layout.tsx`
- **Approach:** Singleton QueryClient with default stale time and retry configuration. Provider wraps root layout.
- **Completion:** All client components can use TanStack Query hooks

### TASK-0.6.2 — Zustand Stores
- **Goal:** Set up client-state management for UI toggles
- **Files:** `stores/ui-store.ts`, `stores/chat-store.ts`
- **Approach:** `ui-store` manages sidebar toggle and theme with localStorage persistence. `chat-store` manages active thread ID and unread counts.
- **Completion:** Stores available to all client components

### TASK-0.7.1 — Project Manifest
- **Goal:** Create project tracking document
- **Files:** `MANIFEST.md`
- **Approach:** Track current phase, completed steps, file paths by phase, architecture decisions, and known issues.

### TASK-0.8.1 — API Error Handling Infrastructure
- **Goal:** Build consistent error handling for all API routes
- **Files:** `lib/api-error.ts`, `lib/api-response.ts`, `lib/api-wrapper.ts`
- **Approach:** Custom error classes (UnauthorizedError, ForbiddenError, NotFoundError, ValidationError, ConflictError, TooManyRequestsError, ApiError) map to HTTP status codes. `withErrorHandler` wraps route handlers for consistent error responses. ZodError maps to 422 with field-level details.
- **Completion:** All API routes use `withErrorHandler`

### TASK-0.8.2 — Validation Utilities
- **Goal:** Provide generic Zod validation wrapper
- **Files:** `lib/validator.ts`
- **Approach:** `validateWithZod<T>()` wraps `schema.safeParse()` with typed results.
- **Completion:** Used throughout the application for input validation

### TASK-0.8.3 — Pagination Utilities
- **Goal:** Provide offset and cursor pagination helpers
- **Files:** `lib/pagination.ts`
- **Approach:** `parseOffsetParams()` handles page/pageSize with bounds. `buildOffsetMeta()` computes pagination metadata. `parseCursorParams()` and `buildCursorMeta()` for cursor-based pagination.
- **Completion:** All paginated endpoints use these utilities

### TASK-0.9.1 — Authentication System
- **Goal:** Configure Better Auth with Prisma adapter, session management, and auth utilities
- **Files:** `app/features/auth/libs/auth.ts`, `auth-client.ts`, `email.ts`, `verification.ts`, `app/features/auth/schema/auth.schema.ts`, `role.schema.ts`
- **Approach:** Better Auth with Prisma adapter, email verification, password reset, social sign-in support. Role schema validates role strings. RBAC utilities in `utils/rbac.ts`. Error handling in `utils/authError.ts`. Redirect logic in `utils/getRedirectPath.ts`.
- **Completion:** Full auth flow works (register, verify, login, logout, reset password)

### TASK-0.9.2 — Auth UI Components
- **Goal:** Build login, registration, and password reset forms
- **Files:** `app/features/auth/components/login-form.tsx`, `signup-form.tsx`, `reset-password-form.tsx`, `auth-layout.tsx`, `form-input.tsx`, `form-button.tsx`, `social-signin-buttons.tsx`, `logout-button.tsx`
- **Approach:** RHF + Zod forms with validation. Auth layout provides consistent styling. Social sign-in buttons for OAuth providers.
- **Completion:** All auth pages render and submit successfully

### TASK-0.9.3 — Auth API Routes
- **Goal:** Set up Better Auth catch-all route handler
- **Files:** `app/api/auth/[...all]/route.ts`
- **Approach:** Better Auth handler configuration for all auth operations.

### TASK-0.10.1 — Role Guard
- **Goal:** Implement canonical authorization guard for protected routes
- **Files:** `app/features/shared/api/require-role.ts`
- **Approach:** `requireRole(allowedRoles)` gets session, validates role, resolves companyId/memberRole for recruiters. Throws UnauthorizedError (401) or ForbiddenError (403).
- **Completion:** All protected API routes and server actions call this guard first

---

## Phase 1: Admin

### TASK-1.1.1 — Admin Schema
- **Goal:** Define Zod schemas for admin operations
- **Files:** `app/features/admin/schema/admin.schema.ts`
- **Approach:** Schemas for user listing params (pagination, filter, sort), ban/unban, role change, admin invites, job listing params, toggle job status
- **Completion:** All admin inputs validated

### TASK-1.1.2 — Admin User Queries
- **Goal:** Implement Prisma queries for user management
- **Files:** `app/features/admin/queries/user-queries.ts`
- **Approach:** `listUsers()` with pagination, role filter, ban status filter, search. `getUserById()` with profile. `listUserSessions()`.
- **Completion:** Admin can query all users

### TASK-1.1.3 — Admin User API Routes
- **Goal:** REST endpoints for user management
- **Files:** `app/api/admin/users/route.ts`, `app/api/admin/users/[id]/route.ts`, `app/api/admin/users/[id]/ban/route.ts`, `app/api/admin/users/[id]/unban/route.ts`, `app/api/admin/users/[id]/role/route.ts`, `app/api/admin/users/[id]/sessions/route.ts`
- **Approach:** `requireRole(["admin", "super_admin"])`. GET list with pagination. GET detail by ID. DELETE remove user. POST ban (set banned, banReason, banExpiresAt; revoke sessions). POST unban. POST set role. GET list sessions. DELETE revoke all sessions.
- **Completion:** Full user CRUD for admins

### TASK-1.1.4 — Admin User Hooks
- **Goal:** TanStack Query hooks for admin user data
- **Files:** `app/features/admin/hooks/use-admin-users.ts`
- **Approach:** `useAdminUsers()`, `useAdminUser()`, `useBanUser()`, `useUnbanUser()`, `useSetUserRole()`, `useRevokeSessions()`
- **Completion:** Client components consume user data via hooks

### TASK-1.2.1 — Admin UI: Users Page
- **Goal:** Admin users management interface
- **Files:** `app/features/admin/components/people-table.tsx`, `ban-dialog.tsx`, `user-profile-view.tsx`, `app/(roles)/admin/users/page.tsx`
- **Approach:** DataTable with search, role filter, ban status filter. BanDialog for ban/unban with reason and expiry. UserProfileView shows profile info and application history with links to applicant detail.
- **Completion:** Admins can search, filter, view, ban/unban users

### TASK-1.2.2 — Admin UI: Recruiters Page
- **Goal:** Admin recruiters management interface
- **Files:** `app/(roles)/admin/recruiters/page.tsx`
- **Approach:** Reuses `people-table.tsx` filtered by recruiter role. Shows company affiliation.

### TASK-1.3.1 — Admin Team Management Actions
- **Goal:** Server actions for admin team invites
- **Files:** `app/features/admin/actions/invite-admin.ts`, `bulk-invite-admin.ts`
- **Approach:** `requireRole(["super_admin"])`. Generate token, create AdminInvite, send email via Resend.
- **Completion:** Super admins can invite new admins

### TASK-1.3.2 — Admin Team Management API
- **Goal:** REST endpoints for admin team management
- **Files:** `app/api/admin/invite/route.ts`, `app/api/admin/invite/accept/route.ts`, `app/api/admin/invite/[id]/route.ts`, `app/api/admin/team/[id]/route.ts`
- **Approach:** GET list invites and team. POST accept invite with token validation. DELETE cancel pending invite. DELETE remove team member.
- **Completion:** Full admin team lifecycle

### TASK-1.3.3 — Admin Team Management UI
- **Goal:** Admin team management interface
- **Files:** `app/features/admin/components/invite-admin-form.tsx`, `admin-team-list.tsx`, `app/(roles)/admin/team/page.tsx`
- **Approach:** RHF + Zod form for invites. DataTable for team members and pending invites. Cancel invite and remove member actions.
- **Completion:** Super admins can manage the admin team

### TASK-1.3.4 — Admin Team Hooks
- **Goal:** TanStack Query hooks for admin team data
- **Files:** `app/features/admin/hooks/use-admin-invites.ts`
- **Approach:** `useAdminInvites()`, `useInviteAdmin()`, `useCancelInvite()`, `useRemoveTeamMember()`

### TASK-1.4.1 — Admin Job Queries
- **Goal:** Prisma queries for admin job oversight
- **Files:** `app/features/admin/queries/job-queries.ts`
- **Approach:** `listJobs()` with pagination, status filter, company filter, date filter, sort.
- **Completion:** Admins can query all jobs across companies

### TASK-1.4.2 — Admin Job API Routes
- **Goal:** REST endpoints for admin job management
- **Files:** `app/api/admin/jobs/route.ts`, `app/api/admin/jobs/[id]/route.ts`
- **Approach:** GET list jobs. DELETE remove job. PATCH toggle isActive (kill-switch).
- **Completion:** Admins can manage any job

### TASK-1.4.3 — Admin Jobs UI
- **Goal:** Admin jobs management interface
- **Files:** `app/features/admin/components/admin-jobs-table.tsx`, `app/(roles)/admin/jobs/page.tsx`
- **Approach:** DataTable with status, company, date filters. Toggle isActive inline.
- **Completion:** Admins can view and deactivate any job

### TASK-1.4.4 — Admin Jobs Hooks
- **Goal:** TanStack Query hooks for admin job data
- **Files:** `app/features/admin/hooks/use-admin-jobs.ts`

### TASK-1.4.5 — Admin Sidebar
- **Goal:** Navigation sidebar for admin dashboard
- **Files:** `app/features/admin/components/admin-sidebar.tsx`, `app/(roles)/admin/layout.tsx`
- **Approach:** Links to Dashboard, Users, Recruiters, Jobs, Team, Messages. Active route highlighting.
- **Completion:** Admin navigation complete

### TASK-1.5.1 — Admin Messaging Queries
- **Goal:** Prisma queries for admin messages
- **Files:** `app/features/admin/queries/message-queries.ts`
- **Approach:** Thread listing, message listing, user search.
- **Completion:** Admins can query message data

### TASK-1.5.2 — Admin Messaging API (REST)
- **Goal:** REST endpoints for admin messaging
- **Files:** `app/api/admin/messages/search/route.ts`, `app/api/admin/messages/[threadId]/route.ts`, `app/api/admin/messages/[threadId]/[messageId]/route.ts`
- **Approach:** GET search users/recruiters. GET messages by thread. POST send message. DELETE thread. DELETE per-message.
- **Completion:** Admins can search and message any user

### TASK-1.5.3 — Admin Messaging UI (REST)
- **Goal:** Admin messaging interface
- **Files:** `app/features/admin/components/admin-message-page.tsx`, `admin-thread-view.tsx`, `app/(roles)/admin/messages/page.tsx`, `app/(roles)/admin/messages/[threadId]/page.tsx`
- **Approach:** Split-panel inbox with thread list and message view. User search combobox.
- **Completion:** Admin messaging works via polling

### TASK-1.5.4 — Admin Messaging Hooks (REST)
- **Goal:** TanStack Query hooks for admin messages
- **Files:** `app/features/admin/hooks/messages/use-admin-messages.ts`

### TASK-1.6.1 — Admin Messaging (Real-time)
- **Goal:** Add Pusher real-time to admin messaging
- **Files:** Updates to admin message components
- **Approach:** Subscribe to `private-thread-{id}` and `private-user-{id}` channels. Real-time message delivery and notification updates.
- **Completion:** Admin messages appear without refresh

### TASK-1.7.1 — Admin Applicant Detail View
- **Goal:** Read-only applicant detail for admins
- **Files:** `app/features/admin/queries/applicant-queries.ts`, `app/api/admin/applications/[applicationId]/detail/route.ts`, `app/features/admin/hooks/use-applicant-detail.ts`, `app/features/admin/components/admin-applicant-detail-page.tsx`, `app/(roles)/admin/applications/[applicationId]/page.tsx`, `app/api/admin/users/[id]/applications/route.ts`
- **Approach:** Admin resume fallback chain (snapshot → live → none). Read-only detail with profile, resume, timeline, messages. User profile updated to include Applications card linking to admin applicant detail.
- **Completion:** Admins can view any applicant

### TASK-1.8.1 — Admin Dashboard
- **Goal:** Admin dashboard with platform statistics
- **Files:** `app/features/admin/queries/dashboard-queries.ts`, `app/features/admin/hooks/use-admin-dashboard.ts`, `app/features/admin/components/admin-dashboard.tsx`, `app/api/admin/dashboard/route.ts`, `app/(roles)/admin/page.tsx`
- **Approach:** Prisma aggregations for total users, jobs, applications, companies. Stat cards, charts (Recharts), and recent data tables.
- **Completion:** Admin dashboard displays platform-wide metrics

---

## Phase 2: Recruiter

### TASK-2.0.1 — Pre-Phase 2 Refactoring
- **Goal:** Extract shared components and role guards for reuse
- **Files:** `components/shared/`, `app/features/shared/api/require-role.ts`
- **Approach:** Generalize admin patterns for recruiter reuse. Extract DataTable, StatusBadge, ConfirmActionButton, PageHeader.

### TASK-2.0.2 — Recruiter Layout & Sidebar
- **Goal:** Recruiter dashboard layout with navigation
- **Files:** `app/features/recruiter/components/recruiter-sidebar.tsx`, `app/(roles)/recruiter/recruiter-layout-client.tsx`, `app/(roles)/recruiter/layout.tsx`
- **Approach:** Sidebar with Dashboard, Company, Team, Jobs, Applicants, Messages, Notifications, Analytics links. RoleLayoutClient integration.
- **Completion:** Recruiter navigation functional

### TASK-2.1.1 — Company Schema
- **Goal:** Zod schema for company CRUD
- **Files:** `app/features/recruiter/schema/company.schema.ts`
- **Approach:** CompanyCreateSchema, CompanyUpdateSchema.
- **Completion:** Company input validated

### TASK-2.1.2 — Company Profile Server Action
- **Goal:** Server action for company upsert
- **Files:** `app/features/recruiter/actions/upsert-company.ts`
- **Approach:** `requireRole(["recruiter"])`. `safeParse` company data. `prisma.company.upsert` with `revalidatePath`.
- **Completion:** Recruiters can create and update company

### TASK-2.1.3 — Company Profile Form
- **Goal:** Company profile form UI
- **Files:** `app/features/recruiter/components/company-form.tsx`, `app/(roles)/recruiter/company/page.tsx`
- **Approach:** RHF + Zod form with name, logo, website, description, industry, social links.
- **Completion:** Company profile CRUD complete

### TASK-2.1.4 — Company Profile Hooks
- **Goal:** TanStack Query hooks for company data
- **Files:** `app/features/recruiter/hooks/use-company-mutation.ts`

### TASK-2.2.1 — Team Schema
- **Goal:** Zod schemas for recruiter team management
- **Files:** `app/features/recruiter/schema/team.schema.ts`
- **Approach:** InviteRecruiterSchema, BulkInviteRecruitersSchema.

### TASK-2.2.2 — Team Management Actions
- **Goal:** Server actions for recruiter team invites
- **Files:** `app/features/recruiter/actions/invite-recruiter.ts`, `bulk-invite-recruiters.ts`
- **Approach:** `requireRole(["recruiter"])`. Generate token, create RecruiterInvite. Bulk invite processes multiple emails.
- **Completion:** Recruiters can invite team members

### TASK-2.2.3 — Team Management API
- **Goal:** REST endpoints for recruiter team management
- **Files:** `app/api/recruiter/invite/route.ts`, `app/api/recruiter/invite/accept/route.ts`, `app/api/recruiter/invite/[id]/route.ts`, `app/api/recruiter/team/[id]/route.ts`
- **Approach:** GET list invites. POST accept with token. DELETE cancel invite. DELETE remove team member.
- **Completion:** Full team lifecycle

### TASK-2.2.4 — Team Management UI
- **Goal:** Recruiter team management interface
- **Files:** `app/features/recruiter/components/invite-recruiter-form.tsx`, `recruiter-team-list.tsx`, `app/(roles)/recruiter/team/page.tsx`, `app/(auth)/recruiter-invite/page.tsx`, `app/(auth)/recruiter-invite/accept-invite-client.tsx`
- **Approach:** Single and bulk invite forms. Team list with remove. Invite email template. Accept invite page with token validation.
- **Completion:** Full recruiter team management

### TASK-2.2.5 — Team Management Hooks
- **Goal:** TanStack Query hooks for recruiter team data
- **Files:** `app/features/recruiter/hooks/use-recruiter-invites.ts`

### TASK-2.3.1 — Job Schema
- **Goal:** Zod schemas for job CRUD and listing
- **Files:** `app/features/recruiter/schema/job.schema.ts`
- **Approach:** JobCreateSchema, JobUpdateSchema, RecruiterListJobsParamsSchema.
- **Completion:** Job input validated

### TASK-2.3.2 — Job Queries
- **Goal:** Prisma queries for job CRUD (tenant-isolated)
- **Files:** `app/features/recruiter/queries/job-queries.ts`
- **Approach:** `listJobs()` filtered by `companyId`. `getJobById()` with company check.
- **Completion:** Recruiter can query own jobs

### TASK-2.3.3 — Job API Routes
- **Goal:** REST endpoints for job CRUD
- **Files:** `app/api/recruiter/jobs/route.ts`, `app/api/recruiter/jobs/[id]/route.ts`, `app/api/recruiter/jobs/[id]/toggle/route.ts`
- **Approach:** GET list (tenant-isolated). POST create. GET single. PATCH update. DELETE (soft for active/archived, hard for draft). POST toggle (draft → active → archived).
- **Completion:** Full job CRUD with tenant isolation

### TASK-2.3.4 — Job Form UI
- **Goal:** Job create and edit interface
- **Files:** `app/features/recruiter/components/job-form.tsx`, `app/(roles)/recruiter/jobs/new/page.tsx`, `app/(roles)/recruiter/jobs/[id]/edit/page.tsx`
- **Approach:** RHF + Zod form with all job fields. Toggle for status transitions.
- **Completion:** Recruiters can create and edit jobs

### TASK-2.3.5 — Job Listing & Detail UI
- **Goal:** Job listing table and detail view
- **Files:** `app/features/recruiter/components/recruiter-jobs-table.tsx`, `job-detail.tsx`, `app/(roles)/recruiter/jobs/page.tsx`, `app/(roles)/recruiter/jobs/[id]/page.tsx`
- **Approach:** DataTable with search, status filter, inline toggle. Detail view with metadata and applicants link.
- **Completion:** Recruiters can view and manage jobs

### TASK-2.3.6 — Job Hooks
- **Goal:** TanStack Query hooks for recruiter job data
- **Files:** `app/features/recruiter/hooks/use-recruiter-jobs.ts`
- **Approach:** `useRecruiterJobs()`, `useCreateJob()`, `useUpdateJob()`, `useDeleteJob()`, `useToggleJobStatus()`

### TASK-2.4.1 — Application Status Change Model
- **Goal:** Add audit trail for application status changes
- **Files:** `prisma/schema.prisma` (ApplicationStatusChange model), `prisma/scripts/backfill-status-changes.ts`
- **Approach:** Model with applicationId, fromStatus (nullable), toStatus, changedById, note. Backfill script for existing applications.
- **Completion:** Every status change creates an audit row

### TASK-2.4.2 — Application Queries
- **Goal:** Prisma queries for applicant management
- **Files:** `app/features/recruiter/queries/application-queries.ts`
- **Approach:** `listApplications()` with pagination, status filter, search, URL-driven state.
- **Completion:** Recruiters can query applicants

### TASK-2.4.3 — Application Schema
- **Goal:** Zod schemas for application operations
- **Files:** `app/features/recruiter/schema/application.schema.ts`
- **Approach:** Status transition validation, list params, bulk transition schema.

### TASK-2.4.4 — Application API Routes
- **Goal:** REST endpoints for applicant management
- **Files:** `app/api/recruiter/applications/[applicationId]/status/route.ts`
- **Approach:** POST transition status with validation. Create ApplicationStatusChange row. Create notification. Tenant isolation.
- **Completion:** Recruiters can move applicants through pipeline

### TASK-2.4.5 — Applicants Table UI
- **Goal:** Applicants listing with filters, pagination, and actions
- **Files:** `app/features/recruiter/components/applicants-table.tsx`, `applicant-table-columns.tsx`, `applicant-table-constants.ts`, `applicant-table-utils.ts`, `applicant-table-toolbar.tsx`, `applicant-table-pagination.tsx`, `applicant-table-feedback.tsx`, `applicants-table-dialogs.tsx`, `application-dialogs.tsx`, `use-applicants-table.ts`, `app/(roles)/recruiter/jobs/[id]/applicants/page.tsx`
- **Approach:** URL-driven pagination, filterable columns, status-colored badges, individual and bulk actions, action buttons (view, message).
- **Completion:** Full applicants management table

### TASK-2.4.6 — Application Hooks
- **Goal:** TanStack Query hooks for applicant data
- **Files:** `app/features/recruiter/hooks/use-applications.ts`
- **Approach:** `useApplications()`, `useTransitionStatus()`, `useBulkTransitionStatus()`, `useRevertStatus()`

### TASK-2.5.1 — Messaging Rate Limiter
- **Goal:** Rate limit for recruiter messages
- **Files:** `app/features/recruiter/libs/rate-limit-message.ts`
- **Approach:** 20 messages per hour per recruiter-applicant pair.
- **Completion:** Rate limit enforced

### TASK-2.5.2 — Recruiter-Applicant Relationship Verification
- **Goal:** Tenant-scoped relationship check for messaging
- **Files:** `app/features/recruiter/libs/verify-recruiter-applicant-relationship.ts`
- **Approach:** Verify recruiter's company has an application from the target user.

### TASK-2.5.3 — Recruiter Messaging API
- **Goal:** REST endpoints for recruiter messaging
- **Files:** `app/api/recruiter/threads/route.ts`, `app/api/recruiter/messages/[threadId]/route.ts`, `app/api/recruiter/messages/search/route.ts`, `app/api/recruiter/applications/[applicationId]/profile/route.ts`
- **Approach:** GET list threads. GET/POST/DELETE messages with Pusher and notifications. Search applicants. Get applicant profile for messaging.
- **Completion:** Full recruiter messaging API

### TASK-2.5.4 — Recruiter Messaging UI
- **Goal:** Recruiter messaging interface
- **Files:** `app/features/recruiter/components/recruiter-messages-page.tsx`, `recruiter-thread-view.tsx`, `app/(roles)/recruiter/messages/page.tsx`
- **Approach:** Split-panel inbox with real-time updates via Pusher.
- **Completion:** Recruiter messaging functional

### TASK-2.5.5 — User Messaging (Reply Side)
- **Goal:** User reply interface for recruiter messages
- **Files:** `app/features/user/components/user-sidebar.tsx`, `user-messages-page.tsx`, `user-thread-view.tsx`, `app/features/user/hooks/messages/use-user-threads.ts`, `use-user-messages.ts`, `app/(roles)/user/user-layout-client.tsx`, `app/(roles)/user/layout.tsx`, `app/(roles)/user/messages/page.tsx`
- **Approach:** Split-panel inbox mirroring recruiter UI. Sidebar with Messages link.
- **Completion:** Users can reply to recruiters

### TASK-2.5.6 — Messaging Hooks
- **Goal:** TanStack Query hooks for recruiter messages
- **Files:** `app/features/recruiter/hooks/messages/use-recruiter-threads.ts`, `use-recruiter-messages.ts`

### TASK-2.6.1 — Applicant Detail Query
- **Goal:** Server query for unified applicant detail
- **Files:** `app/features/recruiter/libs/get-applicant-detail.ts`
- **Approach:** Fetch application + user profile + status timeline + messages.
- **Completion:** Single query returns complete applicant detail

### TASK-2.6.2 — Applicant Detail API
- **Goal:** REST endpoint for applicant detail
- **Files:** `app/api/recruiter/applications/[applicationId]/detail/route.ts`
- **Approach:** Tenant-isolated detail with all related data.
- **Completion:** API returns full applicant profile

### TASK-2.6.3 — File Download Route
- **Goal:** Auth-guarded file proxy for resume downloads
- **Files:** `app/api/files/download/route.ts`
- **Approach:** Check authorization (owner, related recruiter, admin). Proxy file download.
- **Completion:** Secure file downloads

### TASK-2.6.4 — Applicant Detail UI
- **Goal:** Full-page applicant detail view
- **Files:** `app/features/recruiter/components/applicant-detail-page.tsx`, `applicant-detail-skeleton.tsx`, `app/(roles)/recruiter/applicants/[applicationId]/page.tsx`
- **Approach:** Sections for profile, resume (snapshot), status timeline, messages, status actions. Loading skeleton.
- **Completion:** Recruiters can view full applicant details

### TASK-2.6.5 — Applicant Detail Hooks
- **Goal:** TanStack Query hooks for applicant detail
- **Files:** `app/features/recruiter/hooks/use-applicant-detail.ts`
- **Approach:** `useApplicantDetail()`, `useTransitionStatus()` with detail refresh.

### TASK-2.6.6 — Status Timeline Component
- **Goal:** Reusable vertical timeline component
- **Files:** `components/shared/status-timeline.tsx`
- **Approach:** Render ApplicationStatusChange[] in chronological order. Handle single-entry (just applied) case.
- **Completion:** Used by recruiter, admin, and user detail views

### TASK-2.7.1 — DataTable Selection Extension
- **Goal:** Extend DataTable with checkbox selection support
- **Files:** `components/ui/data-table.tsx` (updated)
- **Approach:** `enableSelection`, `selectedIds`, `onSelectionChange`, `getRowId`, checkbox column, `disabledIds`.
- **Completion:** DataTable supports multi-select

### TASK-2.7.2 — Bulk Status API
- **Goal:** Atomic bulk status transition endpoint
- **Files:** `app/api/recruiter/applications/bulk/status/route.ts`
- **Approach:** `requireRole(["recruiter"])`. `$transaction` for atomicity. Validate all transitions before executing any.
- **Completion:** Bulk status changes are atomic

### TASK-2.7.3 — Revert API
- **Goal:** Endpoint to revert application to previous status
- **Files:** `app/api/recruiter/applications/[applicationId]/revert/route.ts`
- **Approach:** Read audit trail, restore previous status, create new audit + notification row.
- **Completion:** Revert functionality with audit trail

### TASK-2.7.4 — Bulk Reject Dialog
- **Goal:** Bulk rejection UI with shared reason
- **Files:** `app/features/recruiter/components/bulk-reject-dialog.tsx`
- **Approach:** Requires reason before submit. Calls mutation with all selected IDs.
- **Completion:** Bulk reject dialog functional

### TASK-2.7.5 — Revert Dialog
- **Goal:** Revert confirmation dialog
- **Files:** `app/features/recruiter/components/revert-dialog.tsx`
- **Approach:** Confirmation before reverting status.

### TASK-2.7.6 — Bulk Action Bar
- **Goal:** Action bar for bulk operations
- **Files:** `app/features/recruiter/components/bulk-action-bar.tsx`
- **Approach:** Appears when selection non-empty. Shows available actions (intersection of valid transitions).
- **Completion:** Bulk action UI complete

### TASK-2.8.1 — Analytics Schema
- **Goal:** Zod schemas for analytics queries
- **Files:** `app/features/recruiter/schema/analytics.schema.ts`
- **Approach:** AnalyticsFilterSchema with date range, status, type, and mode filters. Chart colors and pipeline stage order constants.

### TASK-2.8.2 — Analytics Queries
- **Goal:** Prisma aggregations for analytics
- **Files:** `app/features/recruiter/queries/analytics-queries.ts`
- **Approach:** `getAnalytics()` and `getJobAnalytics()` using `$queryRaw` for aggregations, funnel analysis, and trend data.
- **Completion:** Analytics data computed server-side

### TASK-2.8.3 — Analytics API
- **Goal:** REST endpoints for analytics data
- **Files:** `app/api/recruiter/analytics/route.ts`, `app/api/recruiter/jobs/[id]/analytics/route.ts`
- **Approach:** Standalone and per-job analytics endpoints. Filter-aware.
- **Completion:** Analytics API functional

### TASK-2.8.4 — Analytics Charts
- **Goal:** Reusable chart components
- **Files:** `app/features/recruiter/components/charts/trend-chart.tsx`, `distribution-bar-chart.tsx`, `funnel-chart.tsx`
- **Approach:** Recharts LineChart for trends, BarChart for distributions, custom SVG for pipeline funnel.
- **Completion:** All chart types implemented

### TASK-2.8.5 — Analytics Filter Bar
- **Goal:** Filter controls for analytics
- **Files:** `app/features/recruiter/components/filters/analytics-filter-bar.tsx`, `desktop-filters.tsx`, `mobile-filters.tsx`, `filter-button.tsx`, `filter-options.tsx`
- **Approach:** Calendar date range picker, status/type/mode/location filter dropdowns. Responsive desktop/mobile variants.
- **Completion:** Filters work across analytics pages

### TASK-2.8.6 — Analytics Pages
- **Goal:** Standalone and per-job analytics pages
- **Files:** `app/features/recruiter/components/recruiter-analytics-page.tsx`, `per-job-analytics-page.tsx`, `app/(roles)/recruiter/analytics/page.tsx`, `app/(roles)/recruiter/jobs/[id]/analytics/page.tsx`
- **Approach:** Stat cards, charts, and filter bar. Job detail page updated with tab navigation (Details / Applicants / Analytics).
- **Completion:** Analytics pages functional

### TASK-2.8.7 — Analytics Hooks
- **Goal:** TanStack Query hooks for analytics data
- **Files:** `app/features/recruiter/hooks/use-analytics.ts`
- **Approach:** `useAnalytics()`, `useJobAnalytics()`.

### TASK-2.9.1 — Dashboard Queries
- **Goal:** Prisma queries for recruiter dashboard stats
- **Files:** `app/features/recruiter/queries/dashboard-queries.ts`
- **Approach:** `getRecruiterDashboardStats()` — 5 parallel Prisma counts/queries.
- **Completion:** Dashboard stats computed efficiently

### TASK-2.9.2 — Recruiter Dashboard UI
- **Goal:** Dashboard with stats, recent activity, quick actions
- **Files:** `app/features/recruiter/components/recruiter-dashboard.tsx`, `app/(roles)/recruiter/page.tsx`
- **Approach:** 4 StatCards (total jobs, active applications, interviews, offers). Recent applications DataTable. 4 quick action cards. NoCompanyPrompt for recruiters without a company.
- **Completion:** Recruiter dashboard complete

### TASK-2.10.1 — Shared Notification Utility
- **Goal:** Centralized notification creation with DB + Pusher
- **Files:** `lib/notifications.ts`
- **Approach:** `createNotification()` — single notification with Pusher trigger. `createNotificationsBulk()` — batch notifications. `triggerForCompany()` — notify all company members.
- **Completion:** All notification-creating code uses this utility

### TASK-2.10.2 — Notification Page & Dropdown
- **Goal:** Notification UI components
- **Files:** `app/features/notifications/components/notification-dropdown.tsx`, `notifications-page.tsx`, `app/features/notifications/hooks/use-notifications.ts`, `app/features/notifications/queries/notification-queries.ts`, `app/features/notifications/schema/notification.schema.ts`, `app/(roles)/recruiter/notifications/page.tsx`, `app/(roles)/user/notifications/page.tsx`
- **Approach:** Role-aware dropdown with proper navigation. Infinite-scroll activity page. Real-time updates. Sidebar badge.
- **Completion:** Notification system complete

### TASK-2.10.3 — Notification API
- **Goal:** REST endpoint for notification listing
- **Files:** `app/api/notifications/route.ts`

### TASK-2.10.4 — Refactor Notifications in Existing Routes
- **Goal:** Replace inline notification code with shared utility
- **Files:** `app/api/recruiter/applications/[applicationId]/status/route.ts`, `app/api/recruiter/applications/bulk/status/route.ts`, `app/api/recruiter/applications/[applicationId]/revert/route.ts`, `app/api/recruiter/messages/[threadId]/route.ts`, `app/api/admin/messages/[threadId]/route.ts`
- **Approach:** Replace direct Prisma + Pusher calls with `createNotification()` / `createNotificationsBulk()`.

### TASK-2.11.1 — CSV Builder
- **Goal:** RFC 4180 compliant CSV string builder
- **Files:** `app/features/recruiter/libs/csv-builder.ts`
- **Approach:** `escapeCsvField()`, `buildCsvRow()`, `buildCsvString()` with BOM prefix.
- **Completion:** CSV output is RFC 4180 compliant

### TASK-2.11.2 — Export Queries
- **Goal:** Streaming CSV export with cursor-based batching
- **Files:** `app/features/recruiter/queries/export-queries.ts`
- **Approach:** `exportApplicantsAsCsv()` — ReadableStream with cursor-batched `findMany`, 50K cap, filter-aware.
- **Completion:** Export respects active filters

### TASK-2.11.3 — Export API
- **Goal:** CSV download endpoint
- **Files:** `app/api/recruiter/jobs/[jobId]/applicants/export/route.ts`
- **Approach:** Auth-guarded GET with Content-Disposition attachment header.
- **Completion:** CSV downloads with proper headers

### TASK-2.11.4 — Export UI
- **Goal:** Export button in applicants toolbar
- **Files:** `app/features/recruiter/components/applicants-table.tsx` (updated)
- **Approach:** DownloadIcon + Export CSV link that respects current filters.

---

## Phase 3: User (Job Seeker)

### TASK-3.0a.1 — Infrastructure Audit
- **Goal:** Verify Phase 2 infrastructure supports user role
- **Approach:** Confirm layout, messaging, notifications, and auth work without modification for user role.
- **Completion:** No infrastructure changes needed

### TASK-3.0b.1 — Schema Migration
- **Goal:** Add user-required schema changes
- **Files:** `prisma/schema.prisma`
- **Approach:** Add `deletedAt` to Resume (soft-delete). Add `resumeSnapshotUrl` and `resumeSnapshotBuilderData` to Application (snapshot). Add `ResumeEnhancementLog` model with `[userId, createdAt]` index. Add `Bookmark` model with `@@unique([userId, jobId])`.
- **Completion:** Migration applied

### TASK-3.1.1 — Profile Schema
- **Goal:** Zod schemas for user profile
- **Files:** `app/features/user/schema/profile.schema.ts`
- **Approach:** Headline, bio, skills (deduped, ≤50), experiences (≤20), socialLinks (≤10), salary fields.
- **Completion:** Profile input validated

### TASK-3.1.2 — Profile Server Action
- **Goal:** Server action for profile upsert
- **Files:** `app/features/user/actions/upsert-profile.ts`
- **Approach:** `requireRole(["user"])`. `safeParse` profile data. `prisma.userProfile.upsert`. `revalidatePath`.
- **Completion:** Users can save profiles

### TASK-3.1.3 — Profile Form UI
- **Goal:** User profile editing interface
- **Files:** `app/features/user/components/profile-form.tsx`, `experience-list-editor.tsx`, `social-links-editor.tsx`, `app/(roles)/user/profile/page.tsx`
- **Approach:** RHF + Zod form. Skills tag input with deduplication. `useFieldArray` for dynamic experiences and social links.
- **Completion:** Full profile editing

### TASK-3.1.4 — Profile API & Hooks
- **Goal:** Profile API and hooks
- **Files:** `app/api/user/profile/route.ts`, `app/features/user/hooks/use-profile.ts`
- **Approach:** GET returns current profile. `useProfile()` hook.

### TASK-3.2.1 — Resume Schema
- **Goal:** Zod schemas for resume builder data
- **Files:** `app/features/user/schema/resume.schema.ts`
- **Approach:** BuilderResumeSchema: label, summary, educations, experiences, skills.

### TASK-3.2.2 — Resume API Routes
- **Goal:** REST endpoints for resume CRUD
- **Files:** `app/api/user/resumes/route.ts`, `app/api/user/resumes/[id]/route.ts`, `app/api/user/resumes/[id]/builder-data/route.ts`
- **Approach:** GET list non-deleted resumes. POST multipart upload (PDF/DOC/DOCX ≤10MB, 5-resume cap). PATCH set-primary via `$transaction`. DELETE soft-delete (sets `deletedAt`). PATCH update builder data.
- **Completion:** Full resume CRUD

### TASK-3.2.3 — Resume Builder Server Action
- **Goal:** Server action for saving builder resumes
- **Files:** `app/features/user/actions/save-resume-builder.ts`
- **Approach:** `requireRole(["user"])`. 5-resume cap check. Create Resume with builderData.
- **Completion:** Builder resumes persisted

### TASK-3.2.4 — Resume List & Card UI
- **Goal:** Resume listing and management interface
- **Files:** `app/features/user/components/resume-list.tsx`, `resume-card.tsx`, `resume-upload-button.tsx`, `app/(roles)/user/resumes/page.tsx`
- **Approach:** List with loading/error/empty states. Cards with label, file info, set-primary, download, edit, delete, AI enhance button. Upload button with file validation and success animation.
- **Completion:** Resume management UI complete

### TASK-3.2.5 — Resume Builder Form UI
- **Goal:** In-app resume builder interface
- **Files:** `app/features/user/components/resume-builder-form.tsx`, `app/(roles)/user/resumes/builder/page.tsx`, `app/(roles)/user/resumes/builder/[id]/page.tsx`
- **Approach:** RHF form with `useFieldArray` for educations and experiences. Skills tag input. New builder page and edit (pre-fill) page.
- **Completion:** Resume builder functional

### TASK-3.2.6 — Resume Hooks
- **Goal:** TanStack Query hooks for resume data
- **Files:** `app/features/user/hooks/use-resumes.ts`
- **Approach:** `useResumes()`, `useUploadResume()`, `useSetPrimaryResume()`, `useDeleteResume()`, `useUpdateBuilderData()`

### TASK-3.2a.1 — AI Resume Schema
- **Goal:** Zod schemas for AI enhancement
- **Files:** `app/features/user/schema/resume-ai.schema.ts`
- **Approach:** ResumeSuggestionSchema, EnhancementsResponseSchema, ApplyAiSuggestionsSchema.
- **Completion:** AI data validated

### TASK-3.2a.2 — AI Client Library
- **Goal:** Multi-provider AI abstraction
- **Files:** `lib/ai-client.ts`
- **Approach:** Support Anthropic, OpenAI, and Google providers. Configurable via `AI_PROVIDER` env. Graceful null return when no key configured.
- **Completion:** AI client functional

### TASK-3.2a.3 — AI Enhance API
- **Goal:** Endpoint for AI-powered resume suggestions
- **Files:** `app/api/user/resumes/[id]/ai-enhance/route.ts`
- **Approach:** `requireRole(["user"])`. 5/day rate limit via ResumeEnhancementLog. Call `callAI()` with resume enhancement prompt. Return structured suggestions.
- **Completion:** AI suggestions endpoint functional

### TASK-3.2a.4 — Apply AI Suggestions Action
- **Goal:** Server action to apply AI suggestions
- **Files:** `app/features/user/actions/apply-ai-suggestions.ts`
- **Approach:** Apply suggestions to builderData. Reject file-uploaded resumes.
- **Completion:** Suggestions can be applied

### TASK-3.2a.5 — AI Suggestions Panel UI
- **Goal:** Interface for viewing and applying AI suggestions
- **Files:** `app/features/user/components/ai-suggestions-panel.tsx`
- **Approach:** Suggestions grouped by priority. Score display. Per-item apply/copy actions. Sidebar panel.
- **Completion:** AI suggestions UI complete

### TASK-3.2a.6 — AI Enhance Hooks
- **Goal:** TanStack Query hooks for AI enhancement
- **Files:** `app/features/user/hooks/use-ai-resume-enhance.ts`
- **Approach:** `useAiResumeEnhance()`, `useApplyAiSuggestions()`.

### TASK-3.3.1 — Application Submit Schema
- **Goal:** Zod schema for job application
- **Files:** `app/features/jobs/schema/application-submit.schema.ts`
- **Approach:** resumeId required, coverLetter optional max 5000.
- **Completion:** Application input validated

### TASK-3.3.2 — Rate Limiter
- **Goal:** In-memory sliding-window rate limiter
- **Files:** `lib/rate-limiter.ts`
- **Approach:** Generic rate limiter with configurable max/windowMs. Periodic cleanup every 10 minutes.
- **Completion:** Rate limiter available for all endpoints

### TASK-3.3.3 — Apply Job API
- **Goal:** REST endpoint for job application submission
- **Files:** `app/api/jobs/[id]/apply/route.ts`
- **Approach:** `requireRole(["user"])`. 10/min rate limit. Duplicate check. Resume snapshot creation (fileUrl → resumeSnapshotUrl, builderData → resumeSnapshotBuilderData). Create Application + first ApplicationStatusChange row. `triggerForCompany` notification.
- **Completion:** Apply flow complete

### TASK-3.3.4 — Apply Modal UI
- **Goal:** Job application modal
- **Files:** `app/features/jobs/components/apply-modal.tsx`
- **Approach:** Resume selector list. Cover letter textarea with validation. Success/error states.
- **Completion:** Apply modal functional

### TASK-3.3.5 — Apply Hooks
- **Goal:** TanStack Query hooks for job application
- **Files:** `app/features/jobs/hooks/use-apply-job.ts`
- **Approach:** `useApplyJob()` mutation with query invalidation.

### TASK-3.4.1 — User Application Queries
- **Goal:** Prisma queries for user application list
- **Files:** `app/features/user/queries/user-application-queries.ts`
- **Approach:** `listUserApplications()` paginated/filterable. `getUserApplicationDetail()` with timeline.
- **Completion:** Users can query their applications

### TASK-3.4.2 — User Application API
- **Goal:** REST endpoints for user applications
- **Files:** `app/api/user/applications/route.ts`, `app/api/user/applications/stats/route.ts`
- **Approach:** GET paginated/filtered list. GET stats (total/active/interviews/offers).
- **Completion:** User application API functional

### TASK-3.4.3 — My Applications Page UI
- **Goal:** User application listing page
- **Files:** `app/features/user/components/applications-page.tsx`, `app/(roles)/user/applications/page.tsx`
- **Approach:** Paginated list with status filter, search, company logos, status badges. Links to detail view.
- **Completion:** My Applications page functional

### TASK-3.5.1 — Application Detail API
- **Goal:** REST endpoint for user application detail
- **Files:** `app/api/user/applications/[id]/route.ts`
- **Approach:** GET full detail with timeline. DELETE withdraw (status gate: applied/reviewing only, creates notification).
- **Completion:** User application detail + withdraw

### TASK-3.5.2 — Application Detail View UI
- **Goal:** Full application detail view for users
- **Files:** `app/features/user/components/application-detail-view.tsx`, `application-header.tsx`, `application-timeline.tsx`, `application-sections.tsx`, `application-resume-section.tsx`, `application-actions.tsx`, `app/(roles)/user/applications/[id]/page.tsx`
- **Approach:** Header (job title, company, locations, salary, status badge, inactive warning). Timeline (shared StatusTimeline). Conditional sections (rejection reason, interview details, offer). Resume snapshot display. Withdraw with ConfirmActionButton.
- **Completion:** Full user application detail

### TASK-3.6.1 — Bookmark API
- **Goal:** REST endpoints for job bookmarks
- **Files:** `app/api/user/bookmarks/route.ts`, `app/api/user/bookmarks/[jobId]/route.ts`
- **Approach:** GET list bookmarks with job details. POST toggle (create/delete). GET check specific bookmark status.
- **Completion:** Bookmark API functional

### TASK-3.6.2 — Save Job Button
- **Goal:** Bookmark toggle button component
- **Files:** `app/features/user/components/save-job-button.tsx`
- **Approach:** Bookmark icon toggle. Login redirect for anonymous users with return URL. Authenticated toggle.
- **Completion:** Save job button used on job cards and detail pages

### TASK-3.6.3 — Saved Jobs Page UI
- **Goal:** Saved/bookmarked jobs listing
- **Files:** `app/features/user/components/saved-jobs-page.tsx`, `disabled-job-card.tsx`, `app/(roles)/user/saved-jobs/page.tsx`
- **Approach:** JobCards for active bookmarks. DisabledJobCard (greyed, 50% opacity) for inactive/expired. Un-bookmark action.
- **Completion:** Saved jobs page functional

### TASK-3.6.4 — Bookmark Hooks
- **Goal:** TanStack Query hooks for bookmarks
- **Files:** `app/features/user/hooks/use-saved-jobs.ts`
- **Approach:** `useBookmarkedIds()`, `useBookmarkedJobs()`, `useCheckBookmark()`, `useToggleBookmark()`.

### TASK-3.7.1 — Chat Components (Shared)
- **Goal:** Reusable chat/messaging components
- **Files:** `components/chat/chat-header.tsx`, `chat-input-area.tsx`, `chat-message-list.tsx`, `message-bubble.tsx`, `message-item.ts`, `messages-page-layout.tsx`, `shared-thread-view.tsx`, `thread-list-item.tsx`, `use-pusher-thread.ts`, `use-thread-view.ts`, `features/messages/stores/presence-store.ts`, `use-thread-presence.ts`
- **Approach:** Shared chat primitives used across all roles' messaging interfaces.
- **Completion:** Chat components reused by admin, recruiter, user

---

## Phase 4: Public Job Routes & Home Page

### TASK-4.0.1 — Public Route Group
- **Goal:** Create (public) route group with shared shell
- **Files:** `app/(public)/layout.tsx`
- **Approach:** Layout wraps pages in PublicNavbar + Suspense + Footer.
- **Completion:** Public pages have consistent chrome

### TASK-4.0.2 — Privacy & Terms Pages
- **Goal:** Static placeholder pages
- **Files:** `app/(public)/privacy/page.tsx`, `app/(public)/terms/page.tsx`
- **Approach:** Static content with TODO for legal review.
- **Completion:** Pages accessible at /privacy and /terms

### TASK-4.1.1 — Public Job Queries
- **Goal:** Server-side queries for public job listings
- **Files:** `app/features/jobs/queries/public-job-queries.ts`
- **Approach:** `listPublicJobs()` — full-text search via Prisma `search`, dual-gate filter (status: active AND isActive: true), filters by workMode, employmentType, experienceLevel, industry, companyId. `getPublicJobById()`.
- **Completion:** Public job queries with dual-gate visibility

### TASK-4.1.2 — Public Job API
- **Goal:** REST endpoints for public job data
- **Files:** `app/api/jobs/route.ts`, `app/api/jobs/[id]/route.ts`
- **Approach:** GET list with all filters. GET single with 404 for not-found or non-public jobs.
- **Completion:** Public job API functional

### TASK-4.1.3 — Job Card Component
- **Goal:** Reusable job card for listings
- **Files:** `app/features/jobs/components/job-card.tsx`
- **Approach:** Company logo, title, location, work mode, salary range, skills, bookmark toggle.
- **Completion:** Job cards used across public and user pages

### TASK-4.1.4 — Job Search Bar
- **Goal:** Debounced search input with URL sync
- **Files:** `app/features/jobs/components/job-search-bar.tsx`
- **Approach:** Debounced input with `useDeferredValue` and `useTransition`. URL query param synchronization.
- **Completion:** Search bar functional

### TASK-4.1.5 — Filter Components
- **Goal:** Reusable filter controls
- **Files:** `app/features/jobs/components/filter-select.tsx`
- **Approach:** Dropdown select for work mode, employment type, experience level, industry, company.
- **Completion:** Filters integrated with listing

### TASK-4.1.6 — Job List Page
- **Goal:** Public job listing page
- **Files:** `app/features/jobs/components/job-list-page.tsx`, `app/(public)/jobs/page.tsx`
- **Approach:** Search bar, filters, paginated job cards, empty state for no results vs. no jobs at all.
- **Completion:** Public job listings functional

### TASK-4.2.1 — View Tracking API
- **Goal:** Endpoint for job view counting
- **Files:** `app/api/jobs/[id]/view/route.ts`
- **Approach:** POST increment viewCount. 100/min rate limit. 30-min sessionStorage dedup.
- **Completion:** View tracking functional

### TASK-4.2.2 — Job Detail View
- **Goal:** Public job detail page
- **Files:** `app/features/jobs/components/job-detail-view.tsx`, `app/(public)/jobs/[id]/page.tsx`
- **Approach:** Full job detail with header, company preview card, description, skills, apply button (auth-aware). Inactive job state. View count increment.
- **Completion:** Job detail page functional

### TASK-4.3.1 — Auth-Aware Public Navbar
- **Goal:** Public navigation with auth-aware rendering
- **Files:** `app/features/public/components/public-navbar.tsx`, `public-navbar-skeleton.tsx`, `mobile-nav-menu.tsx`
- **Approach:** Sticky navbar. Auth-aware: logo, Jobs/Resources links, theme toggle, account popover or login button. Mobile menu with slide-over.
- **Completion:** Navbar adapts to auth state

### TASK-4.3.2 — Account Popover
- **Goal:** Role-aware user account dropdown
- **Files:** `app/features/public/components/account-popover.tsx`
- **Approach:** Avatar, name, role badge. Role-specific links: admin/recruiter get Dashboard, user gets Profile/Applications/Saved Jobs/Messages. Sign out.
- **Completion:** Account popover complete

### TASK-4.3.3 — Sign Out Hook
- **Goal:** Sign out utility with redirect
- **Files:** `app/features/public/hooks/use-sign-out.ts`
- **Approach:** Wrap `signOut()` with `router.push("/")`.
- **Completion:** Sign out functional

### TASK-4.4.1 — Hero Search Section
- **Goal:** Full-viewport hero with job search
- **Files:** `app/features/public/components/hero-search.tsx`
- **Approach:** Background image with gradient overlay. JobSearchBar. CTA buttons. Motion animations.
- **Completion:** Hero section functional

### TASK-4.4.2 — Category Strip
- **Goal:** Job category navigation tiles
- **Files:** `app/features/public/components/category-strip.tsx`, `lib/job-categories.ts`
- **Approach:** 5 category tiles (Technology, Healthcare, Finance, Marketing, Remote). Staggered animation. Each links to /jobs with category filter.
- **Completion:** Category navigation functional

### TASK-4.4.3 — Featured Jobs
- **Goal:** Featured jobs section on home page
- **Files:** `app/features/landing/components/featured-jobs.tsx`, `featured-jobs-grid.tsx`
- **Approach:** Server component fetches 6 active jobs. Client grid with staggered Motion animations.
- **Completion:** Featured jobs display correctly

### TASK-4.4.4 — Featured Companies
- **Goal:** Top companies section
- **Files:** `app/features/public/components/featured-companies.tsx`, `app/features/public/queries/list-featured-companies.ts`
- **Approach:** Server query for top 6 companies by active job count. CompanyPreviewCards with staggered animation.
- **Completion:** Featured companies display correctly

### TASK-4.4.5 — How It Works Section
- **Goal:** 3-step explanation section
- **Files:** `app/features/landing/components/how-it-works.tsx`
- **Approach:** 3 steps with staggered animation. Static content.
- **Completion:** How It Works section complete

### TASK-4.4.6 — Testimonials
- **Goal:** Auto-rotating testimonial carousel
- **Files:** `app/features/landing/components/testimonials.tsx`
- **Approach:** 6 testimonials with fade transitions. Auto-rotation.
- **Completion:** Testimonials carousel functional

### TASK-4.4.7 — Stats Banner
- **Goal:** Animated stat counters
- **Files:** `app/features/landing/components/stats-banner.tsx`, `stats-counter.tsx`
- **Approach:** 4 counters with animated number transitions on scroll. Reduced-motion aware.
- **Completion:** Stats banner functional

### TASK-4.4.8 — Employer CTA
- **Goal:** Employer call-to-action section
- **Files:** `app/features/public/components/employer-cta.tsx`
- **Approach:** Dark CTA section with mailto link for recruiter access requests.
- **Completion:** Employer CTA complete

### TASK-4.4.9 — Landing Page Composition
- **Goal:** Compose all home page sections
- **Files:** `app/features/landing/components/landing-page.tsx`, `app/(public)/page.tsx`
- **Approach:** Server component composing all sections.

### TASK-4.5.1 — Career Resources Page
- **Goal:** Static career resources page
- **Files:** `app/features/public/components/career-resources/index.ts`, `career-resources-page.tsx`, `resource-hero.tsx`, `resume-tips-section.tsx`, `interview-checklist-section.tsx`, `salary-faq-section.tsx`, `resources-cta.tsx`, `app/(resources)/page.tsx`
- **Approach:** Animated hero. Resume tips (5 items). Interview checklist (7 items). Salary FAQ (4 accordion items). CTA section.
- **Completion:** Career resources page complete

### TASK-4.5.2 — Footer Component
- **Goal:** Site-wide footer
- **Files:** `app/features/landing/components/footer.tsx`
- **Approach:** 4-column footer: Product, Resources, Company, Legal. Links to privacy, terms, resources.
- **Completion:** Footer present on all public pages

### TASK-4.6.1 — Sitemap
- **Goal:** Dynamic XML sitemap
- **Files:** `app/sitemap.ts`
- **Approach:** Static entries (/, /jobs, /resources, /privacy, /terms). Dynamic job entries filtered by dual-gate, ordered by updatedAt desc. Zero jobs → valid sitemap with static entries only.
- **Completion:** Sitemap accessible at /sitemap.xml

### TASK-4.6.2 — Robots.txt
- **Goal:** Robots exclusion rules
- **Files:** `app/robots.ts`
- **Approach:** Disallow /admin, /recruiter, /user, /api. Allow everything else. Sitemap URL reference.
- **Completion:** robots.txt accessible

### TASK-4.6.3 — JSON-LD Structured Data
- **Goal:** JobPosting structured data for job detail pages
- **Files:** `app/(public)/jobs/[id]/page.tsx` (generateMetadata)
- **Approach:** Injected via `generateMetadata` `other` object. All fields null-guarded. baseSalary only when salary data exists. jobLocation only when locations non-empty. employmentType only when non-null.
- **Completion:** JSON-LD present on job detail pages

### TASK-4.7.1 — Supporting Layout Cleanup
- **Goal:** Clean up root layout after public shell extraction
- **Files:** `app/layout.tsx` (updated)
- **Approach:** Root layout provides only Providers + theme script. Public nav/footer moved to (public) route group.
- **Completion:** No double-navbar issues

### TASK-4.7.2 — Route Constants Update
- **Goal:** Add new public paths to route constants
- **Files:** `lib/routes.ts` (updated)
- **Approach:** Add /privacy, /terms to PUBLIC_CONTENT_PATHS.
- **Completion:** Navbar shows correctly on privacy/terms pages
