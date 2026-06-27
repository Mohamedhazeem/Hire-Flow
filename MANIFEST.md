# Hire Flow Next - Project Manifest

> **Purpose:** This file acts as the agent's "long-term memory". It tracks what has been built, what is pending, and critical architectural decisions. The agent **must** update this file at the end of every session.

---

## Last Updated

2026-06-27T06:10:00Z

---

## Overview

- **Current Phase:** Phase 2
- **Current Step:** Step 2.9 - Recruiter Dashboard — COMPLETE
- **Next Step:** Step 2.10 — Notifications & Activity Feed (per HIRE_FLOW_PROMPTS.md)
- **Blockers:** Prisma migration cannot run locally — database server at db.prisma.io:5432 is unreachable; client generation is successful. Migration `add_application_status_change` is pending deploy.

---

## Completed Steps

### Phase 0: Foundation

- [x] Step 0.0 - Project Initialisation & Dependencies
- [x] Step 0.1 - Prisma Schema
- [x] Step 0.2 - Middleware & Route Guards
- [x] Step 0.3 - Shared UI Primitives
- [x] Step 0.4 - Mock File Upload Provider
- [x] Step 0.5 - Database Seed Script
- [x] Step 0.6 - TanStack Query Provider & Zustand Stores
- [x] Step 0.7 - Project Manifest (this file)

### Phase 1: Admin

- [x] Step 1.1 - Admin API (Queries & Ban Action)
- [x] Step 1.2 - Admin UI (Users & Recruiters)
- [x] Step 1.3 - Admin Team Management
- [x] Step 1.4 - Admin Job Oversight & Analytics
- [x] Step 1.5 - Admin Messaging Entry Point (REST + polling)
- [x] Step 1.6 - Real-Time Admin Messaging (Pusher — private-thread, private-user channels, NotificationDropdown bell)

### Phase 2: Recruiter

- [x] Step 2.0 - Pre-Phase 2 Refactoring: Extract Shared Components & Role Guards
- [x] Step 2.0 - Recruiter Layout & Sidebar
- [x] Step 2.1 - Company Profile CRUD
- [x] Step 2.2 - Recruiter Team Management
- [x] Step 2.3 - Job Posts CRUD
- [x] Step 2.4 - Applicants View & Status Updates (7-status pipeline, OCC, URL-driven pagination, in-app notifications)
- [x] Step 2.5 - Recruiter Direct Messaging (Thread‑based, Pusher realtime, rate-limited, user reply page)
- [x] Step 2.6 - Applicant Detail View (Profile, Timeline, Resume download, Messages, Status actions)
- [x] Step 2.7 - Bulk Actions for Selection (mass status transitions, checkbox selection, bulk reject dialog, in-app notifications)

### Phase 3: User

- [ ] Step 3.1 - User Profile
- [ ] Step 3.2 - Resumes & In-App Builder
- [ ] Step 3.3 - Job Application Flow (Includes Email Notifications)
- [ ] Step 3.4 - User Activity Panel (Uses Shared Data Table)

### Phase 4: Public Job Routes & Home Page

- [ ] Step 4.1 - Public Job Listings
- [ ] Step 4.2 - Public Job Details & View Tracking
- [ ] Step 4.3 - Home Page & Global Navbar

### Phase 5: Messaging & Notifications

- [ ] Step 5.1 - Messaging & Real-Time Setup
- [ ] Step 5.2 - Real-Time Subscriptions & Shared Chat UI
- [ ] Step 5.3 - Wiring Chat into Role Pages
- [ ] Step 5.4 - Real-Time Notifications System

---

## Created File Paths (Grouped by Phase)

### Phase 0

- prisma/schema.prisma (platform models & enums)
- prisma/seed.ts (test data)
- proxy.ts (middleware)
- app/(roles)/admin/layout.tsx
- app/(roles)/admin/page.tsx
- app/(roles)/recruiter/layout.tsx
- app/(roles)/recruiter/page.tsx
- app/(roles)/user/layout.tsx
- app/(roles)/user/page.tsx
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx
- app/(auth)/verify-email/page.tsx
- app/(auth)/reset-password/page.tsx
- app/(auth)/unauthorized/page.tsx
- app/api/upload/route.ts
- app/layout.tsx (wrapped in Providers)
- app/providers.tsx (QueryClientProvider)
- lib/utils.ts (cn helper)
- lib/api-response.ts (ok/fail helpers)
- lib/pagination.ts (offset & cursor pagination)
- lib/upload.ts (mock file upload)
- lib/query-client.ts (QueryClient singleton + defaultQueryFn)
- lib/api-client.ts (thin fetch wrapper)
- stores/ui-store.ts (Zustand - sidebar, theme)
- stores/chat-store.ts (Zustand - activeThreadId, unreadCounts)
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/badge.tsx
- components/ui/table.tsx
- components/ui/select.tsx
- components/ui/popover.tsx
- components/ui/textarea.tsx
- components/ui/dialog.tsx
- components/ui/data-table.tsx
- components/ui/status-badge.tsx
- components/layout/page-header.tsx
- components/back-button.tsx
- components/error-page.tsx
- MANIFEST.md (this file)

### Phase 1

- features/admin/schema/admin.schema.ts (Zod schemas for admin queries/ban)
- features/admin/queries/user-queries.ts (Prisma queries: listUsers, getUserById, listUserSessions)
- features/admin/api/require-admin.ts (server-side admin auth guard)
- features/admin/hooks/use-admin-users.ts (TanStack Query hooks)
- app/api/admin/users/route.ts (GET - list users with pagination/filter/sort)
- app/api/admin/users/[id]/route.ts (GET - user detail, DELETE - remove user)
- app/api/admin/users/[id]/ban/route.ts (POST - ban user)
- app/api/admin/users/[id]/unban/route.ts (POST - unban user)
- app/api/admin/users/[id]/role/route.ts (POST - set user role)
- app/api/admin/users/[id]/sessions/route.ts (GET - list sessions, DELETE - revoke all)
- app/features/admin/components/ban-dialog.tsx (Ban/unban dialog)
- app/features/admin/components/people-table.tsx (Shared data-table)
- app/(roles)/admin/users/page.tsx (Admin users management)
- app/(roles)/admin/recruiters/page.tsx (Admin recruiters management)
- app/features/admin/schema/admin.schema.ts (AdminInviteSchema, AdminAcceptInviteSchema)
- app/features/admin/actions/invite-admin.ts (Server action: create invite)
- app/features/admin/hooks/use-admin-invites.ts (TanStack Query: invites, cancel, remove)
- app/features/admin/components/invite-admin-form.tsx (RHF + Zod form)
- app/features/admin/components/admin-team-list.tsx (DataTable of team + invites)
- app/(roles)/admin/team/page.tsx (Admin team management)
- app/api/admin/invite/route.ts (GET - list invites & team members)
- app/api/admin/invite/accept/route.ts (POST - accept invite with token)
- app/api/admin/invite/[id]/route.ts (DELETE - cancel pending invite)
- app/api/admin/team/[id]/route.ts (DELETE - remove admin from team)
- features/admin/schema/admin.schema.ts (AdminListJobsParamsSchema, AdminToggleJobStatusSchema)
- app/features/admin/queries/job-queries.ts (Prisma queries: listJobs)
- app/features/admin/hooks/use-admin-jobs.ts (TanStack Query hooks)
- app/features/admin/components/admin-jobs-table.tsx (DataTable with filters)
- app/features/admin/components/admin-sidebar.tsx (Sidebar nav)
- app/api/admin/jobs/route.ts (GET - list jobs with pagination/filter/sort)
- app/api/admin/jobs/[id]/route.ts (DELETE - remove job, PATCH - toggle active)
- app/(roles)/admin/jobs/page.tsx (Admin jobs management)
- app/(roles)/admin/layout.tsx (Updated with AdminSidebar)
- app/features/admin/queries/dashboard-queries.ts (Prisma aggregations)
- app/features/admin/hooks/use-admin-dashboard.ts (TanStack Query hook)
- app/features/admin/components/admin-dashboard.tsx (Stat cards, charts, tables)
- app/api/admin/dashboard/route.ts (GET - dashboard stats)
- app/features/admin/components/start-thread-search.tsx (Search combobox)
- app/features/admin/components/thread-view.tsx (Full thread view with messages, file attachments, delete)
- app/features/admin/hooks/messages/use-admin-messages.ts (TanStack Query hooks: messages, send, delete)
- app/features/admin/queries/message-queries.ts (Prisma queries: threads, messages)
- app/api/admin/messages/search/route.ts (GET - search users/recruiters)
- app/api/admin/messages/[threadId]/route.ts (GET - messages, POST - send, DELETE - thread)
- app/api/admin/messages/[threadId]/[messageId]/route.ts (DELETE - per-message)
- app/(roles)/admin/messages/page.tsx (Messages list page)
- app/(roles)/admin/messages/[threadId]/page.tsx (Dynamic thread route)
- components/ui/skeleton.tsx (Shared Skeleton component)
- lib/api-response.ts (Updated with fail helper for ValidationError)

### Phase 2

- app/features/recruiter/actions/
- app/features/recruiter/actions/upsert-company.ts
- app/features/recruiter/actions/invite-recruiter.ts
- app/features/recruiter/actions/bulk-invite-recruiters.ts
- app/features/recruiter/components/
- app/features/recruiter/components/recruiter-sidebar.tsx
- app/features/recruiter/components/company-form.tsx
- app/features/recruiter/components/invite-recruiter-form.tsx
- app/features/recruiter/components/recruiter-team-list.tsx
- app/features/recruiter/components/email/recruiter-invite-email.tsx
- app/features/recruiter/queries/
- app/features/recruiter/schema/
- app/features/recruiter/schema/company.schema.ts
- app/features/recruiter/schema/team.schema.ts
- app/features/recruiter/libs/
- app/features/recruiter/hooks/
- app/features/recruiter/hooks/use-company-mutation.ts
- app/features/recruiter/hooks/use-recruiter-invites.ts
- app/(roles)/recruiter/recruiter-layout-client.tsx
- app/(roles)/recruiter/layout.tsx (updated: wraps RecruiterLayoutClient)
- app/(roles)/recruiter/company/page.tsx
- app/(roles)/recruiter/team/page.tsx
- app/(auth)/recruiter-invite/page.tsx
- app/(auth)/recruiter-invite/accept-invite-client.tsx
- app/api/recruiter/invite/route.ts
- app/api/recruiter/invite/accept/route.ts
- app/api/recruiter/invite/[id]/route.ts
- app/api/recruiter/team/[id]/route.ts
- components/shared/confirm-action-button.tsx (shared — used by team list)
- app/features/recruiter/schema/job.schema.ts (JobCreateSchema, JobUpdateSchema, RecruiterListJobsParamsSchema)
- app/features/recruiter/queries/job-queries.ts (listJobs, getJobById — tenant-isolated by companyId)
- app/features/recruiter/hooks/use-recruiter-jobs.ts (useRecruiterJobs, useCreateJob, useUpdateJob, useDeleteJob, useToggleJobStatus)
- app/features/recruiter/components/recruiter-jobs-table.tsx (DataTable with search, filters, pagination, inline status toggle)
- app/features/recruiter/components/job-form.tsx (RHF + Zod form for create/edit)
- app/features/recruiter/components/job-detail.tsx (Full job detail view with metadata + applicants placeholder)
- app/api/recruiter/jobs/route.ts (GET list + POST create)
- app/api/recruiter/jobs/[id]/route.ts (GET single + PATCH update + DELETE with soft/hard logic)
- app/api/recruiter/jobs/[id]/toggle/route.ts (POST toggle draft→active→archived)
- app/(roles)/recruiter/jobs/page.tsx (Job listing page with DataTable)
- app/(roles)/recruiter/jobs/new/page.tsx (Create job page)
- app/(roles)/recruiter/jobs/[id]/page.tsx (Job detail page)
- app/(roles)/recruiter/jobs/[id]/edit/page.tsx (Edit job page)

### Phase 2 (continued — Step 2.5 Messaging)

- app/features/recruiter/libs/verify-recruiter-applicant-relationship.ts (tenant-scoped relationship check)
- app/features/recruiter/libs/rate-limit-message.ts (20 msgs/hr per pair)
- app/api/recruiter/threads/route.ts (GET — list recruiter threads)
- app/api/recruiter/messages/[threadId]/route.ts (GET/POST/DELETE — thread CRUD with Pusher + Notifications)
- app/api/recruiter/messages/search/route.ts (GET — search applicants)
- app/api/recruiter/applications/[applicationId]/profile/route.ts (GET — applicant user lookup)
- app/features/recruiter/hooks/messages/use-recruiter-threads.ts
- app/features/recruiter/hooks/messages/use-recruiter-messages.ts
- app/features/recruiter/components/recruiter-messages-page.tsx (split-panel inbox)
- app/(roles)/recruiter/messages/page.tsx
- app/features/user/components/user-sidebar.tsx (sidebar with Messages link)
- app/features/user/components/user-messages-page.tsx (split-panel inbox)
- app/features/user/components/user-thread-view.tsx (full chat with Pusher)
- app/features/user/hooks/messages/use-user-threads.ts
- app/features/user/hooks/messages/use-user-messages.ts
- app/(roles)/user/user-layout-client.tsx
- app/(roles)/user/layout.tsx (updated with UserLayoutClient + UserSidebar)
- app/(roles)/user/messages/page.tsx
- lib/api-error.ts (added TooManyRequestsError — 429)
- lib/api-wrapper.ts (registered TooManyRequestsError → 429)
- app/features/recruiter/components/applicants-table.tsx (added MessageSquareTextIcon action button)

### Phase 2 (continued — Step 2.6 Applicant Detail View)

- prisma/schema.prisma (added ApplicationStatusChange model)
- prisma/scripts/backfill-status-changes.ts (one-time backfill script)
- app/api/files/download/route.ts (GET — auth-guarded file proxy for resume/file downloads)
- app/api/recruiter/applications/[applicationId]/detail/route.ts (GET — unified applicant detail)
- app/api/recruiter/applications/[applicationId]/status/route.ts (added ApplicationStatusChange creation on every transition)
- app/features/recruiter/libs/get-applicant-detail.ts (server query: application + profile + timeline + messages)
- app/features/recruiter/hooks/use-applicant-detail.ts (TanStack Query hooks: detail, status transition with refresh)
- app/features/recruiter/components/applicant-detail-page.tsx (full-page detail view: profile, resume, timeline, messages, status actions)
- app/features/recruiter/components/applicant-detail-skeleton.tsx (loading skeleton)
- app/(roles)/recruiter/applicants/[applicationId]/page.tsx (Next.js page route)
- components/shared/status-timeline.tsx (reusable vertical timeline component)
- app/features/recruiter/components/applicants-table.tsx (added EyeIcon button → /recruiter/applicants/[id])
- app/features/recruiter/components/job-detail.tsx (replaced applicants placeholder with View All link)
- tsconfig.json (excluded prisma/scripts from typecheck)

### Phase 2 (continued — Step 2.7 Bulk Actions)

- components/ui/data-table.tsx (extended with selection: enableSelection, selectedIds, onSelectionChange, getRowId, checkbox column, disabledIds)
- app/features/recruiter/schema/application.schema.ts (added BulkStatusTransitionSchema)
- app/api/recruiter/applications/bulk/status/route.ts (POST — atomic bulk status transition with tenant isolation, $transaction)
- app/features/recruiter/hooks/use-applications.ts (added useBulkTransitionStatus, useRevertStatus hooks)
- app/features/recruiter/components/bulk-reject-dialog.tsx (bulk rejection dialog with shared reason)
- app/features/recruiter/components/applicants-table.tsx (selection state, bulk action bar, intersection-based available actions, BulkRejectDialog integration, actionedIds one-time constraint, feedback banner, revert support, colored filter dots)
- app/features/recruiter/components/revert-dialog.tsx (revert confirmation dialog)
- app/api/recruiter/applications/[applicationId]/revert/route.ts (POST — revert application to previous status from audit trail)

### Phase 2 (continued — Step 2.8 Recruiter Analytics & Filters)

- app/features/recruiter/schema/analytics.schema.ts (AnalyticsFilterSchema, types, CHART_COLORS, FUNNEL_STAGE_ORDER)
- app/features/recruiter/queries/analytics-queries.ts (getAnalytics, getJobAnalytics — $queryRaw aggregations, funnel, trends)
- app/api/recruiter/analytics/route.ts (GET — standalone analytics)
- app/api/recruiter/jobs/[id]/analytics/route.ts (GET — per-job analytics)
- app/features/recruiter/hooks/use-analytics.ts (useAnalytics, useJobAnalytics hooks)
- app/features/recruiter/components/charts/trend-chart.tsx (reusable LineChart)
- app/features/recruiter/components/charts/distribution-bar-chart.tsx (reusable BarChart)
- app/features/recruiter/components/charts/funnel-chart.tsx (custom pipeline funnel visualization)
- app/features/recruiter/components/filters/analytics-filter-bar.tsx (calendar daterange, status/type/mode/location filters)
- app/features/recruiter/components/recruiter-analytics-page.tsx (standalone analytics page)
- app/features/recruiter/components/per-job-analytics-page.tsx (per-job analytics page)
- app/(roles)/recruiter/analytics/page.tsx (standalone page wrapper)
- app/(roles)/recruiter/jobs/[id]/analytics/page.tsx (per-job page wrapper)
- app/features/recruiter/components/job-detail.tsx (added tab navigation — View Details / Applicants / Analytics)
- app/(roles)/recruiter/jobs/[id]/applicants/page.tsx (renamed from [jobId] to [id] for consistency)

### Phase 2 (continued — Step 2.9 Recruiter Dashboard)

- app/features/recruiter/queries/dashboard-queries.ts (DashboardData + getRecruiterDashboardStats — 5 parallel Prisma counts/queries)
- app/features/recruiter/components/recruiter-dashboard.tsx (client component: 4 StatCards, recent applications DataTable, 4 quick action cards)
- app/(roles)/recruiter/page.tsx (replaced placeholder with server-side call + NoCompanyPrompt + RecruiterDashboard)

### Phase 3

_(agent to fill)_

### Phase 4

_(agent to fill)_

### Phase 5

_(agent to fill)_

---

## Pending Dependencies

- Phase 1 complete; Phase 2 Steps 2.0–2.2 complete.
- Prisma migrations cannot run locally — `localhost:5432` unreachable. `status` column added to `Job` model (`String @default("draft")` replacing `isActive: Boolean`). Client generation succeeds; `db push` can apply schema changes without migration file.

## Upcoming Dependencies (Phase 2)

- Step 2.3 (Job Posts CRUD) — complete.
- Step 2.4 (Applicants View) — depends on job posts existing.
- Step 2.8 (Analytics) — complete. Depends on job posts, applications, and status changes.
- Phase 2 must be complete before Phase 3 (User) or Phase 4 (Public Routes).

## Upcoming Dependencies (Phase 1)

- Step 1.1 must be built before Step 1.2 (UI depends on API hooks).
- Step 1.1-1.3 must be built before Step 1.4 (admin job oversight depends on invite system).
- Step 1.4 must be built before Step 1.5 (messaging entry point needs sidebar nav).

---



## Active Global Context Snapshot

- **Mutations/Fetching:** REST route handlers for complex mutations; Server Actions only for plain forms. TanStack Query for all client-side data.
- **State Management:** Zustand strictly for UI client-state (sidebars, modals), never for API data.
- **Real-time:** Pusher with `private-thread-[id]` and `private-user-[id]` channels. Admin and Recruiter/User messaging both use Pusher for realtime delivery.
- **Route Guards:** Role-based middleware and layout-level protection.
- **Styling:** Tailwind v4 + Shadcn, using theme variables, no hardcoded hex.
- **Validation:** Always run prisma validate and npm run build after changes.

---

## Known Issues / TODOs

- [ ] TODO: Replace mock upload (/api/upload) with S3/Vercel Blob in production.
- [x] TODO: Implement Pusher messaging backend — DONE in Step 1.6 + Step 2.5.
- [ ] TODO: Add comprehensive tests once core features are stable.
- [ ] TODO: Run Prisma migration `add_company_team_member_and_recruiter_invite` when database is reachable.
- [ ] TODO: `form.watch()` triggers React Compiler `react-hooks/incompatible-library` warning — project-wide pattern, not a regression.
