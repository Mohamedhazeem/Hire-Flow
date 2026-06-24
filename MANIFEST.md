# Hire Flow Next - Project Manifest

> **Purpose:** This file acts as the agent's "long-term memory". It tracks what has been built, what is pending, and critical architectural decisions. The agent **must** update this file at the end of every session.

---

## Last Updated

2026-06-25T01:43:00Z

---

## Overview

- **Current Phase:** Phase 1
- **Current Step:** Step 1.5 - Admin Messaging Entry Point
- **Next Step:** Step 2.1 - Company Profile CRUD
- **Blockers:** None

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
- [x] Step 1.5 - Admin Messaging Entry Point
      _(Note: Phase 1 also successfully established the global `api-error.ts`, React Email pipeline, Bulk Actions, and URL-based table filtering patterns)._

### Phase 2: Recruiter

- [ ] Step 2.0 - Pre-Phase 2 Refactoring: Extract Shared Components & Role Guards
- [ ] Step 2.1 - Company Profile CRUD
- [ ] Step 2.2 - Job Posts CRUD
- [ ] Step 2.3 - Applicants View & Status Updates (Includes Bulk Actions & Email)
- [ ] Step 2.4 - Recruiter Analytics & Filters (URL-driven state)

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

_(agent to fill)_

### Phase 3

_(agent to fill)_

### Phase 4

_(agent to fill)_

### Phase 5

_(agent to fill)_

---

## Pending Dependencies

- None - Phase 0 complete, ready to start Phase 1 (Admin features).

## Upcoming Dependencies (Phase 1)

- Step 1.1 must be built before Step 1.2 (UI depends on API hooks).
- Step 1.1-1.3 must be built before Step 1.4 (admin job oversight depends on invite system).
- Step 1.4 must be built before Step 1.5 (messaging entry point needs sidebar nav).

---

## Active Global Context Snapshot

- **Mutations/Fetching:** REST route handlers for complex mutations; Server Actions only for plain forms. TanStack Query for all client-side data.
- **State Management:** Zustand strictly for UI client-state (sidebars, modals), never for API data.
- **Real-time:** Pusher with private-thread-[id] and private-user-[id] channels.
- **Route Guards:** Role-based middleware and layout-level protection.
- **Styling:** Tailwind v4 + Shadcn, using theme variables, no hardcoded hex.
- **Validation:** Always run prisma validate and npm run build after changes.

---

## Known Issues / TODOs

- [ ] TODO: Replace mock upload (/api/upload) with S3/Vercel Blob in production.
- [ ] TODO: Implement Pusher messaging backend (Phase 5).
- [ ] TODO: Add comprehensive tests once core features are stable.
