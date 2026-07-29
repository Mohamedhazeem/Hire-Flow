# Hire Flow Next - Project Manifest

> **Purpose:** This file acts as the agent's "long-term memory". It tracks what has been built, what is pending, and critical architectural decisions. The agent **must** update this file at the end of every session.

---

## Last Updated

2026-07-29T13:00:00Z

---

## Overview

- **Current Phase:** Cross-Phase Enhancements (Rate Limiting + Skills Filter + Profile Extension)
- **Current Step:** Rate Limiting lib/rate-limiting/ (13 production files, 80+ tests) — COMPLETE
- **Next Step:** _(none — all defined implementation tasks complete)_
- **Blockers:** Pre-existing `react-pdf` CSS import error in `resume-preview-dialog.tsx` blocks `next build` (unrelated). Prisma migration/`db push` cannot run locally — `db.prisma.io:5432` unreachable.

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
- [x] Step 1.6 - Real-Time Admin Messaging (Pusher -- private-thread, private-user channels, NotificationDropdown bell)

### Phase 2: Recruiter

- [x] Step 2.0 - Pre-Phase 2 Refactoring: Extract Shared Components & Role Guards
- [x] Step 2.0 - Recruiter Layout & Sidebar
- [x] Step 2.1 - Company Profile CRUD
- [x] Step 2.2 - Recruiter Team Management
- [x] Step 2.3 - Job Posts CRUD
- [x] Step 2.4 - Applicants View & Status Updates (7-status pipeline, OCC, URL-driven pagination, in-app notifications)
- [x] Step 2.5 - Recruiter Direct Messaging (Thread-based, Pusher realtime, rate-limited, user reply page)
- [x] Step 2.6 - Applicant Detail View (Profile, Timeline, Resume download, Messages, Status actions)
- [x] Step 2.7 - Bulk Actions for Selection (mass status transitions, checkbox selection, bulk reject dialog, in-app notifications)
- [x] Step 2.8 - Recruiter Analytics & Filters (per-job + standalone analytics, charts, funnel, calendar daterange, advanced filters)
- [x] Step 2.9 - Recruiter Dashboard (4 StatCards, recent applications, quick actions, NoCompanyPrompt)
- [x] Step 2.10 - Notifications & Activity Feed (shared lib/notifications.ts utility, role-aware dropdown + standalone activity page, sidebar badge, refactored 4 route handlers to use shared utility)
- [x] Step 2.11 - Export Applicants (CSV) (RFC 4180 csv-builder.ts, ReadableStream cursor-batched export, /api/recruiter/jobs/[jobId]/applicants/export route, filter-aware Export CSV button in toolbar)
- [x] Admin Applicant Detail View (cross-phase built after Phase 3 schema changes: admin-applicant-detail-page.tsx, resume fallback chain, self-download extension)

### Phase 3: User

- [x] Step 3.0a - Infrastructure Audit (Phase 2 spillover satisfied layout/messaging/notifications)
- [x] Step 3.0b - Schema Migration (`deletedAt` on Resume, `resumeSnapshotUrl`/`resumeSnapshotBuilderData` on Application)
- [x] Step 3.1 - User Profile (RHF + Zod, experience/social link editors, server action upsert, skills dedup)
- [x] Step 3.2 - Resumes & In-App Builder (file upload PDF/DOC/DOCX <=10MB, structured JSON builder, set primary, soft-delete 60-day, 5-resume cap, self-download)
- [x] Step 3.2a - AI-Powered Resume Assistance (multi-provider Claude/OpenAI/Gemini via lib/ai-client.ts, 5/day rate limit, suggestion panel with per-suggestion copy, ATS score)
- [x] Step 3.3 - Job Application Flow (REST POST, snapshot at apply time -- fileUrl/builderData frozen into Application, ApplicationStatusChange first row, rate limited 10/min, duplicate detection, triggerForCompany notification)
- [x] Step 3.4 - User Activity Panel / My Applications (paginated/filterable list, status badges, search, distinct empty states, stats endpoint)
- [x] Step 3.5 - Application Detail, Withdraw & Message Recruiter (status timeline via shared StatusTimeline, resume snapshot display, withdraw with status gate, thread-based messaging)
- [x] Step 3.6 - Saved / Bookmarked Jobs (toggle bookmark on job cards, dedicated saved-jobs page, login redirect for anonymous, disabled-job-card for inactive posts)

### Phase 4: Public Job Routes & Home Page

- [x] Step 4.0 - Public Route Group & Shared Shell (`(public)` route group, PublicNavbar + Footer, Privacy/Terms static placeholder pages)
- [x] Step 4.1 - Public Job Listings (full-text search via Prisma `search`, dual-gate filter `status:'active' AND isActive:true`, filters: workMode/employmentType/experienceLevel/industry/companyId, offset pagination)
- [x] Step 4.2 - Public Job Details & View Tracking (company preview card, view count increment with 30-min sessionStorage dedup, anonymous "Log in to Apply" CTA, inactive-job state)
- [x] Step 4.3 - Auth-Aware Navbar, Redirect Logic & Account Popover (role-aware popover, middleware redirect for logged-in on /login, user--> /jobs landing)
- [x] Step 4.4 - Home Page Composition (Hero Search, Category Strip, Featured Jobs, Featured Companies, How It Works, Testimonials, Employer CTA, motion animations)
- [x] Step 4.5 - Career Resources (static page: resume tips, interview checklist, salary FAQ sections)
- [x] Step 4.6 - SEO (dynamic sitemap.xml with dual-gate job entries, robots.txt disallowing role/api paths, JSON-LD JobPosting structured data via generateMetadata, all fields null-guarded)

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
- app/api/admin/messages/route.ts
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
- components/shared/confirm-action-button.tsx (shared - used by team list)
- app/features/recruiter/schema/job.schema.ts (JobCreateSchema, JobUpdateSchema, RecruiterListJobsParamsSchema)
- app/features/recruiter/queries/job-queries.ts (listJobs, getJobById - tenant-isolated by companyId)
- app/features/recruiter/hooks/use-recruiter-jobs.ts (useRecruiterJobs, useCreateJob, useUpdateJob, useDeleteJob, useToggleJobStatus)
- app/features/recruiter/components/recruiter-jobs-table.tsx (DataTable with search, filters, pagination, inline status toggle)
- app/features/recruiter/components/job-form.tsx (RHF + Zod form for create/edit)
- app/features/recruiter/components/job-detail.tsx (Full job detail view with metadata + applicants placeholder)
- app/api/recruiter/jobs/route.ts (GET list + POST create)
- app/api/recruiter/jobs/[id]/route.ts (GET single + PATCH update + DELETE with soft/hard logic)
- app/api/recruiter/jobs/[id]/toggle/route.ts (POST toggle draft->active->archived)
- app/(roles)/recruiter/jobs/page.tsx (Job listing page with DataTable)
- app/(roles)/recruiter/jobs/new/page.tsx (Create job page)
- app/(roles)/recruiter/jobs/[id]/page.tsx (Job detail page)
- app/(roles)/recruiter/jobs/[id]/edit/page.tsx (Edit job page)

### Phase 2 (continued - Step 2.5 Messaging)

- app/features/recruiter/libs/verify-recruiter-applicant-relationship.ts (tenant-scoped relationship check)
- app/features/recruiter/libs/rate-limit-message.ts (20 msgs/hr per pair)
- app/api/recruiter/threads/route.ts (GET - list recruiter threads)
- app/api/recruiter/messages/[threadId]/route.ts (GET/POST/DELETE - thread CRUD with Pusher + Notifications)
- app/api/recruiter/messages/search/route.ts (GET - search applicants)
- app/api/recruiter/applications/[applicationId]/profile/route.ts (GET - applicant user lookup)
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
- lib/api-error.ts (added TooManyRequestsError - 429)
- lib/api-wrapper.ts (registered TooManyRequestsError -> 429)
- app/features/recruiter/components/applicants-table.tsx (added MessageSquareTextIcon action button)

### Phase 2 (continued - Step 2.6 Applicant Detail View)

- prisma/schema.prisma (added ApplicationStatusChange model)
- prisma/scripts/backfill-status-changes.ts (one-time backfill script)
- app/api/files/download/route.ts (GET - auth-guarded file proxy for resume/file downloads)
- app/api/recruiter/applications/[applicationId]/detail/route.ts (GET - unified applicant detail)
- app/api/recruiter/applications/[applicationId]/status/route.ts (added ApplicationStatusChange creation on every transition)
- app/features/recruiter/libs/get-applicant-detail.ts (server query: application + profile + timeline + messages)
- app/features/recruiter/hooks/use-applicant-detail.ts (TanStack Query hooks: detail, status transition with refresh)
- app/features/recruiter/components/applicant-detail-page.tsx (full-page detail view: profile, resume, timeline, messages, status actions)
- app/features/recruiter/components/applicant-detail-skeleton.tsx (loading skeleton)
- app/(roles)/recruiter/applicants/[applicationId]/page.tsx (Next.js page route)
- components/shared/status-timeline.tsx (reusable vertical timeline component)
- app/features/recruiter/components/applicants-table.tsx (added EyeIcon button -> /recruiter/applicants/[id])
- app/features/recruiter/components/job-detail.tsx (replaced applicants placeholder with View All link)
- tsconfig.json (excluded prisma/scripts from typecheck)

### Phase 2 (continued - Step 2.7 Bulk Actions)

- components/ui/data-table.tsx (extended with selection: enableSelection, selectedIds, onSelectionChange, getRowId, checkbox column, disabledIds)
- app/features/recruiter/schema/application.schema.ts (added BulkStatusTransitionSchema)
- app/api/recruiter/applications/bulk/status/route.ts (POST - atomic bulk status transition with tenant isolation, $transaction)
- app/features/recruiter/hooks/use-applications.ts (added useBulkTransitionStatus, useRevertStatus hooks)
- app/features/recruiter/components/bulk-reject-dialog.tsx (bulk rejection dialog with shared reason)
- app/features/recruiter/components/applicants-table.tsx (selection state, bulk action bar, intersection-based available actions, BulkRejectDialog integration, actionedIds one-time constraint, feedback banner, revert support, colored filter dots)
- app/features/recruiter/components/revert-dialog.tsx (revert confirmation dialog)
- app/api/recruiter/applications/[applicationId]/revert/route.ts (POST - revert application to previous status from audit trail)

### Phase 2 (continued - Step 2.8 Recruiter Analytics & Filters)

- app/features/recruiter/schema/analytics.schema.ts (AnalyticsFilterSchema, types, CHART_COLORS, FUNNEL_STAGE_ORDER)
- app/features/recruiter/queries/analytics-queries.ts (getAnalytics, getJobAnalytics - $queryRaw aggregations, funnel, trends)
- app/api/recruiter/analytics/route.ts (GET - standalone analytics)
- app/api/recruiter/jobs/[id]/analytics/route.ts (GET - per-job analytics)
- app/features/recruiter/hooks/use-analytics.ts (useAnalytics, useJobAnalytics hooks)
- app/features/recruiter/components/charts/trend-chart.tsx (reusable LineChart)
- app/features/recruiter/components/charts/distribution-bar-chart.tsx (reusable BarChart)
- app/features/recruiter/components/charts/funnel-chart.tsx (custom pipeline funnel visualization)
- app/features/recruiter/components/filters/analytics-filter-bar.tsx (calendar daterange, status/type/mode/location filters)
- app/features/recruiter/components/recruiter-analytics-page.tsx (standalone analytics page)
- app/features/recruiter/components/per-job-analytics-page.tsx (per-job analytics page)
- app/(roles)/recruiter/analytics/page.tsx (standalone page wrapper)
- app/(roles)/recruiter/jobs/[id]/analytics/page.tsx (per-job page wrapper)
- app/features/recruiter/components/job-detail.tsx (added tab navigation - View Details / Applicants / Analytics)
- app/(roles)/recruiter/jobs/[id]/applicants/page.tsx (renamed from [jobId] to [id] for consistency)

### Phase 2 (continued - Step 2.9 Recruiter Dashboard)

- app/features/recruiter/queries/dashboard-queries.ts (DashboardData + getRecruiterDashboardStats - 5 parallel Prisma counts/queries)
- app/features/recruiter/components/recruiter-dashboard.tsx (client component: 4 StatCards, recent applications DataTable, 4 quick action cards)
- app/(roles)/recruiter/page.tsx (replaced placeholder with server-side call + NoCompanyPrompt + RecruiterDashboard)

### Phase 2 (continued - Step 2.10 Notifications & Activity Feed)

- lib/notifications.ts (shared utility: createNotification, createNotificationsBulk, triggerForCompany - DB + Pusher in one call)
- app/features/notifications/components/notifications-page.tsx (standalone activity page with infinite scroll, role-aware routing)
- app/(roles)/recruiter/notifications/page.tsx (page wrapper for recruiter)
- app/(roles)/user/notifications/page.tsx (page wrapper for user - prevents 404 on existing sidebar link)
- components/layout/role-layout-client.tsx (accepts messagesBasePath prop for role-aware notification navigation)
- app/(roles)/recruiter/recruiter-layout-client.tsx (passes messagesBasePath="/recruiter/messages")
- app/(roles)/user/user-layout-client.tsx (passes messagesBasePath="/user/messages")
- app/(roles)/admin/admin-layout-client.tsx (passes messagesBasePath="/admin/messages" explicitly)
- app/features/notifications/components/notification-dropdown.tsx (role-aware getNotificationHref for recruiter/user/admin)
- app/features/recruiter/components/recruiter-sidebar.tsx (added Notifications link with dynamic unread badge via useUnreadCount)
- app/api/recruiter/applications/[applicationId]/status/route.ts (refactored to use createNotification)
- app/api/recruiter/applications/bulk/status/route.ts (refactored to use createNotificationsBulk - now fires Pusher)
- app/api/recruiter/applications/[applicationId]/revert/route.ts (added notification creation - was missing)
- app/api/recruiter/messages/[threadId]/route.ts (refactored to use createNotification)
- app/api/admin/messages/[threadId]/route.ts (refactored to use createNotification)

### Phase 2 (continued - Step 2.11 CSV Export)

- app/features/recruiter/libs/csv-builder.ts (RFC 4180 CSV string builder: escapeCsvField, buildCsvRow, buildCsvString with BOM)
- app/features/recruiter/queries/export-queries.ts (exportApplicantsAsCsv - ReadableStream with cursor-batched findMany, 50K cap, filter-aware)
- app/api/recruiter/jobs/[jobId]/applicants/export/route.ts (GET - auth-guarded CSV download with Content-Disposition attachment)
- app/features/recruiter/components/applicants-table.tsx (added DownloadIcon + Export CSV link in filter toolbar)

### Admin Applicant Detail View (cross-phase)

- app/features/admin/queries/applicant-queries.ts (getAdminApplicantDetail - admin resume fallback chain, getUserApplications - list user's apps)
- app/api/admin/applications/[applicationId]/detail/route.ts (GET - admin applicant detail endpoint)
- app/features/admin/hooks/use-applicant-detail.ts (useAdminApplicantDetail hook)
- app/features/admin/hooks/use-admin-users.ts (updated: added useAdminUserApplications hook)
- app/features/admin/components/admin-applicant-detail-page.tsx (read-only detail view: profile, resume with preview/download/error, timeline, messages)
- app/(roles)/admin/applications/[applicationId]/page.tsx (route: /admin/applications/[id])
- app/api/admin/users/[id]/applications/route.ts (GET - user's applications list)
- app/features/admin/components/user-profile-view.tsx (updated: added Applications card with StatusBadge + links to /admin/applications/[id])
- app/features/admin/components/people-table.tsx (updated: added EyeIcon -> /admin/users/[id] in actions)

### Phase 3 - Step 3.1 (User Profile)

- app/features/user/schema/profile.schema.ts (Zod: headline, bio, skills deduped <=50, experiences <=20, socialLinks <=10, salary: basePay/ctc/ectc)
- app/features/user/actions/upsert-profile.ts (server action: requireRole(["user"]), ProfileSchema.safeParse, prisma.userProfile.upsert, revalidatePath)
- app/features/user/components/profile-form.tsx (RHF + zodResolver, all profile fields, skills tag input)
- app/features/user/components/experience-list-editor.tsx (useFieldArray, company/title/startDate/endDate->Present, descriptions, add/remove)
- app/features/user/components/social-links-editor.tsx (platform select, URL, optional label, add/remove)
- app/features/user/hooks/use-profile.ts (useQuery -> GET /api/user/profile)
- app/(roles)/user/profile/page.tsx (server component: fetches existing profile, passes to ProfileForm)
- app/api/user/profile/route.ts (GET - returns current user profile fields)

### Phase 3 - Step 3.2 (Resumes & In-App Builder)

- app/features/user/schema/resume.schema.ts (BuilderResumeSchema: label, summary, educations[], experiences[], skills[])
- app/api/user/resumes/route.ts (GET - list own non-deleted resumes; POST - multipart upload PDF/DOC/DOCX <=10MB, 5-resume cap)
- app/api/user/resumes/[id]/route.ts (PATCH - set-primary via $transaction; DELETE - soft-delete sets deletedAt, preserves file)
- app/api/user/resumes/[id]/builder-data/route.ts (PATCH - update builderData for builder-created resumes)
- app/features/user/actions/save-resume-builder.ts (server action: requireRole, 5-resume cap, creates Resume with builderData)
- app/features/user/components/resume-list.tsx (lists resumes with loading/error/empty states, download via /api/files/download)
- app/features/user/components/resume-card.tsx (label, file info/builder summary, set-primary star, download, edit, delete, AI enhance button)
- app/features/user/components/resume-upload-button.tsx (file input, PDF/DOC/DOCX validation, 10MB max, POST via FormData, success animation)
- app/features/user/components/resume-builder-form.tsx (RHF: label, summary, educations useFieldArray, experiences useFieldArray, skills tags)
- app/features/user/hooks/use-resumes.ts (useResumes, useUploadResume, useSetPrimaryResume, useDeleteResume, useUpdateBuilderData)
- app/(roles)/user/resumes/page.tsx (PageHeader + ResumeList, metadata)
- app/(roles)/user/resumes/builder/page.tsx (ResumeBuilderForm for new builder resume)
- app/(roles)/user/resumes/builder/[id]/page.tsx (fetches existing builder resume, pre-fills form, ownership check)

### Phase 3 - Step 3.2a (AI Resume Enhancement)

- app/features/user/schema/resume-ai.schema.ts (ResumeSuggestionSchema + EnhancementsResponseSchema: suggestions/overallScore/projectedScore/keyStrengths/improvementAreas)
- app/api/user/resumes/[id]/ai-enhance/route.ts (POST - requireRole(["user"]), 5/day rate limit via ResumeEnhancementLog, calls callAI, clamps projectedScore)
- app/features/user/components/ai-suggestions-panel.tsx (suggestions grouped by section/priority, ScoreGauge dual-score display, per-suggestion copy, sessionStorage-cached)
- app/features/user/hooks/use-ai-resume-enhance.ts (useMutation: useAiResumeEnhance)
- app/features/user/hooks/use-ai-suggestions-cache.ts (sessionStorage cache layer: djb2 hash, 30min TTL, SSR-safe)
- lib/ai-client.ts (multi-provider: Anthropic/OpenAI/Google, configurable via AI_PROVIDER env, graceful fallback)

### Phase 3 - Step 3.3 (Job Application Flow)

- app/api/jobs/[id]/apply/route.ts (POST - requireRole(["user"]), 10/min rate limit, duplicate check, snapshot creation, ApplicationStatusChange first row, triggerForCompany notification)
- app/features/jobs/schema/application-submit.schema.ts (Zod: resumeId required, coverLetter optional max 5000)
- app/features/jobs/components/apply-modal.tsx (resume selector list, cover letter textarea, validation, success/error states)
- app/features/jobs/hooks/use-apply-job.ts (TanStack Query mutation, invalidates applicable queries on success)
- lib/rate-limiter.ts (in-memory sliding-window rate limiter with configurable max/windowMs, periodic cleanup)

### Phase 3 - Step 3.4 (My Applications)

- app/features/user/queries/user-application-queries.ts (listUserApplications paginated/filterable; getUserApplicationDetail with status timeline)
- app/features/user/components/applications-page.tsx (paginated list, status filter dropdown, search input, company logos, status badges, link to detail)
- app/(roles)/user/applications/page.tsx (renders ApplicationsPage, metadata: "My Applications")
- app/api/user/applications/route.ts (GET - paginated/filtered application list)
- app/api/user/applications/stats/route.ts (GET - counts: total/active/interviews/offers)

### Phase 3 - Step 3.5 (Application Detail, Withdraw & Message Recruiter)

- app/features/user/components/application-detail-view.tsx (full detail: header, timeline, sections, resume snapshot, withdraw, fetches via API)
- app/features/user/components/application-header.tsx (job title, company, locations, work mode, salary, status badge, inactive-job warning)
- app/features/user/components/application-timeline.tsx (wraps shared StatusTimeline with ApplicationStatusChange data)
- app/features/user/components/application-sections.tsx (conditional: rejection reason, interview date+link, offer details)
- app/features/user/components/application-resume-section.tsx (shows snapshot: builder data summary or file download link)
- app/features/user/components/application-actions.tsx (withdraw with ConfirmActionButton, only when canWithdraw)
- app/(roles)/user/applications/[id]/page.tsx (route page, renders ApplicationDetailView, metadata)
- app/api/user/applications/[id]/route.ts (GET - full detail; DELETE - withdraw, status gate applied/reviewing only, createNotification)

### Phase 3 - Step 3.6 (Saved / Bookmarked Jobs)

- app/features/user/hooks/use-saved-jobs.ts (useBookmarkedIds, useBookmarkedJobs, useCheckBookmark, useToggleBookmark - all TanStack Query)
- app/features/user/components/saved-jobs-page.tsx (lists bookmarked jobs via useBookmarkedJobs, JobCard for active, DisabledJobCard for inactive)
- app/features/user/components/save-job-button.tsx (bookmark toggle icon, login redirect for anonymous, checks auth session)
- app/features/user/components/disabled-job-card.tsx (greyed-out card for inactive/expired saved jobs, 50% opacity, un-bookmark allowed)
- app/(roles)/user/saved-jobs/page.tsx (renders SavedJobsPage, metadata: "Saved Jobs")
- app/api/user/bookmarks/route.ts (GET - list bookmarks with job details; POST - toggle bookmark create/delete)
- app/api/user/bookmarks/[jobId]/route.ts (GET - check if specific job is bookmarked, returns { bookmarked: boolean })

### Phase 3 - Supporting

- prisma/schema.prisma (added `deletedAt` to Resume, `resumeSnapshotUrl`/`resumeSnapshotBuilderData` to Application, `ResumeEnhancementLog` model with [userId, createdAt] index, `Bookmark` model with @@unique([userId, jobId]))
- app/api/files/download/route.ts (extended: auth check also allows userId === resume.userId for self-download)

### Phase 4 - Steps 4.0-4.2 (Public Routes, Jobs, Details)

- app/(public)/layout.tsx (public layout: PublicNavbar + Suspense + Footer)
- app/(public)/page.tsx (home page - renders LandingPage)
- app/(public)/jobs/page.tsx (browse jobs - renders JobListPage, metadata)
- app/(public)/jobs/[id]/page.tsx (job detail - render JobDetailView, generateMetadata + JSON-LD JobPosting structured data)
- app/(public)/privacy/page.tsx (static placeholder, 6 sections, TODO for legal review)
- app/(public)/terms/page.tsx (static placeholder, 6 sections, TODO for legal review)
- app/features/landing/components/landing-page.tsx (composes all landing sections)
- app/features/landing/components/footer.tsx (4-column footer: Product/Resources/Company/Legal, privacy/terms/resources links)
- app/features/landing/components/featured-jobs.tsx (server component, fetches 6 active jobs via listPublicJobs)
- app/features/landing/components/featured-jobs-grid.tsx (client, animated JobCard grid with staggered motion)
- app/features/landing/components/how-it-works.tsx (3-step static section with staggered animation)
- app/features/landing/components/testimonials.tsx (auto-rotating carousel, 6 testimonials, fade transitions)
- app/features/landing/components/stats-banner.tsx (4 stat counters)
- app/features/landing/components/stats-counter.tsx (animated counter on scroll, reduced-motion aware)
- app/features/jobs/queries/public-job-queries.ts (listPublicJobs: full-text search via Prisma search, dual-gate filter status:active AND isActive:true, filters: workMode/employmentType/experienceLevel/industry/companyId; getPublicJobById)
- app/features/jobs/components/job-card.tsx (card with company logo, title, location, work mode, salary range, skills, bookmark toggle)
- app/features/jobs/components/job-list-page.tsx (search bar, filters, pagination, 2 distinct empty states)
- app/features/jobs/components/job-detail-view.tsx (full job detail: header, company preview card, description, skills, apply button)
- app/features/jobs/components/job-search-bar.tsx (debounced search, useDeferredValue + useTransition, URL sync)
- app/features/jobs/components/filter-select.tsx (reusable filter select component)
- app/api/jobs/route.ts (GET - public job listing with all filters, delegates to listPublicJobs)
- app/api/jobs/[id]/route.ts (GET - single public job detail, 404 if not found)
- app/api/jobs/[id]/view/route.ts (POST - increment viewCount, 100/min rate limit, 30-min sessionStorage dedup)
- app/api/jobs/[id]/apply/route.ts (POST - submit application, see Phase 3 Step 3.3)

### Phase 4 - Step 4.3 (Auth-Aware Navbar & Redirect)

- app/features/public/components/public-navbar.tsx (sticky navbar, auth-aware rendering, logo, Jobs/Resources links, theme toggle, account popover, mobile menu toggle)
- app/features/public/components/public-navbar-skeleton.tsx (loading skeleton for PublicNavbar)
- app/features/public/components/mobile-nav-menu.tsx (slide-over mobile nav, auth-aware action buttons)
- app/features/public/components/account-popover.tsx (role-aware dropdown: avatar, name, role badge, dash links, sign out)
- app/features/public/hooks/use-sign-out.ts (wraps signOut() with router.push("/"))
- lib/routes.ts (AUTH_PAGES, PROTECTED_ROUTES, PUBLIC_CONTENT_PATHS, isHiddenRoute function)
- proxy.ts (updated: logged-in users on /login or /register -> redirect to role home)
- components/shared/avatar-fallback.tsx (shared avatar component)

### Phase 4 - Step 4.4 (Home Page Composition)

- app/features/public/components/hero-search.tsx (full-viewport hero, background image, gradient overlay, JobSearchBar, CTAs)
- app/features/public/components/category-strip.tsx (5 category tiles: Technology, Healthcare, Finance, Marketing, Remote, staggered animation)
- app/features/public/components/featured-companies.tsx (server component, top 6 companies with active jobs, CompanyPreviewCards)
- app/features/public/components/employer-cta.tsx (dark CTA section, mailto recruiter access request)
- app/features/public/queries/list-featured-companies.ts (server query, orders by job count desc)
- lib/job-categories.ts (JOB_CATEGORIES curated constant: label + filter mapping)
- components/shared/company-preview-card.tsx (shared company card used by featured companies + job detail)

### Phase 4 - Step 4.5 (Career Resources)

- app/(resources)/page.tsx (route wrapper with metadata: "Career Resources")
- app/features/public/components/career-resources/index.ts (barrel export)
- app/features/public/components/career-resources/career-resources-page.tsx (composes all sections)
- app/features/public/components/career-resources/resource-hero.tsx (animated hero)
- app/features/public/components/career-resources/resume-tips-section.tsx (5 resume tips with icons)
- app/features/public/components/career-resources/interview-checklist-section.tsx (7-item checklist)
- app/features/public/components/career-resources/salary-faq-section.tsx (4 accordion FAQs)
- app/features/public/components/career-resources/resources-cta.tsx (CTA section linking to /jobs)

### Phase 4 - Step 4.6 (SEO)

- app/sitemap.ts (static entries: /, /jobs, /resources, /privacy, /terms + dynamic job entries filtered by dual-gate, ordered by updatedAt desc)
- app/robots.ts (disallow /admin, /recruiter, /user, /api; allow everything else; sitemap URL)

### Phase 4 - Supporting Changes

- app/layout.tsx (cleaned: removed PublicNavbar, PublicNavbarSkeleton, Suspense -- root now provides only Providers + theme script)
- app/features/landing/components/footer.tsx (updated Legal column: Privacy Policy -> /privacy, Terms of Service -> /terms, removed Cookie Policy link)
- lib/routes.ts (added /privacy, /terms to PUBLIC_CONTENT_PATHS)

### Cross-Phase: Rate Limiting Architecture (lib/rate-limiting/)

- lib/rate-limiting/types.ts (RateLimitEndpoint, CleanupConfig, FailStrategyConfig, PruneResult, EndpointLimit)
- lib/rate-limiting/config.ts (validateConfig 20+ conditions, freezeConfig, immutability)
- lib/rate-limiting/clock.ts (Clock interface + SystemClock)
- lib/rate-limiting/repository.ts (RateLimitRepository + PrismaRateLimitRepository, batched DELETE with SKIP LOCKED)
- lib/rate-limiting/rate-limiter.ts (RateLimiter + RateLimiterImpl, single clock capture)
- lib/rate-limiting/middleware.ts (withRateLimit wrapper, fail strategy open/closed per endpoint)
- lib/rate-limiting/di.ts (wiring: validateConfig + freezeConfig + singleton rateLimiter)
- lib/rate-limiting/metrics.ts (OTel counters, histograms, gauges, spans)
- lib/rate-limiting/telemetry.ts (AsyncLocalStorage trace context, enrichLog, generateRequestId)
- lib/rate-limiting/request-context.ts (getSessionCache AsyncLocalStorage)
- lib/rate-limiting/ip-hash.ts (HMAC-SHA256 IP hashing, extractIP with proxy trust)
- lib/rate-limiting/cleanup.ts (startCleanup/stopCleanup with setInterval + unref)
- lib/rate-limiting/repository.fake.ts (in-memory FakeRepository)
- app/features/shared/api/require-role.ts (AsyncLocalStorage session cache fast-path)
- Routes wired with withRateLimit:
  - app/api/jobs/[id]/view/route.ts (jobs:view)
  - app/api/jobs/[id]/apply/route.ts (jobs:apply)
  - app/api/user/resumes/[id]/ai-enhance/route.ts (resumes:ai-enhance)
  - app/api/user/resumes/route.ts (resumes:list, resumes:upload)
  - app/api/user/profile/route.ts (profile:read)
  - app/api/user/applications/route.ts (applications:list)
  - app/api/user/bookmarks/route.ts, app/api/user/bookmarks/[jobId]/route.ts (bookmarks:list, bookmarks:toggle)
  - app/api/notifications/route.ts (notifications:list)
  - lib/handlers/messages.ts (messages:list, messages:send, messages:delete)
- Old rate limiting deleted: lib/rate-limit.ts, lib/repositories/rate-limit-repository.ts, app/features/recruiter/libs/rate-limit-message.ts
- Analytics-queries.ts refactored: $queryRawUnsafe -> Prisma.sql + Prisma.join()
- docs/architecture/rate-limiting.md created
- lib/test/unit/rate-limiting/ — 10 test files, 80 tests total
- lib/test/unit/rate-limiting/repository.prisma.contract.test.ts — 8 real-DB contract tests

### Cross-Phase: Skills Filter for Job Search (TASK-4.1.7)

- app/features/jobs/components/skill-filter.tsx (new: wraps AutocompleteInput + SKILLS_DATABASE)
- prisma/migrations/20260729000000_add_skills_gin_index/migration.sql (GIN index on Job.skills)
- app/features/jobs/queries/public-job-queries.ts (PublicJobListParams gains skills: string[], listPublicJobs filters with hasSome)
- app/api/jobs/route.ts (parses ?skills=React,TypeScript or multiple ?skills= params)
- app/features/recruiter/schema/job.schema.ts (RecruiterListJobsParamsSchema gains skills: string[], max 10)
- app/features/recruiter/queries/job-queries.ts (listJobs gains skills hasSome filter)
- app/api/recruiter/jobs/route.ts (parses skills from query string)
- app/features/jobs/components/job-list-page.tsx (SkillFilter added to filter bar, URL serialization comma-joined)
- app/features/recruiter/components/recruiter-jobs-table.tsx (SkillFilter added, skills prop in params)
- lib/test/integration/jobs/public-job-queries.test.ts (7 new skills filter tests: empty, single, OR, non-match, AND with search, empty skills array, case sensitivity)

### Cross-Phase: Recruiter & Admin Profile Pages (TASK-3.1.5)

- app/features/user/actions/upsert-profile.ts (role guard relaxed: user, recruiter, admin)
- app/api/user/profile/route.ts (role guard relaxed: user, recruiter, admin)
- app/(roles)/recruiter/profile/page.tsx (new: server component + ProfileForm)
- app/(roles)/admin/profile/page.tsx (new: server component + ProfileForm)
- app/features/recruiter/components/recruiter-sidebar.tsx (Profile link added)
- app/features/admin/components/admin-sidebar.tsx (Profile link added)

---

## Key Architecture Decisions

### Resume Snapshot (Phase 3)

At apply time, the user's current resume is frozen into Application fields:

- fileUrl -> resumeSnapshotUrl (file ID stored separately)
- builderData -> resumeSnapshotBuilderData (JSON frozen in)
  This survives resume soft-deletion. Recruiters always see the submitted version. Application detail page shows snapshot, not live resume.

### ApplicationStatusChange (Phase 3)

Both recruiter (Phase 2.6) and user (Phase 3.3) create the first status change row at apply time (fromStatus: null, toStatus: "applied"). The shared StatusTimeline component works unmodified for both sides.

### Multi-Provider AI (Phase 3)

lib/ai-client.ts supports Anthropic/OpenAI/Google via AI_PROVIDER env var. Falls back to null if no API key is configured (UI shows graceful "AI features temporarily unavailable" message). Rate limit: 5 requests per user per day enforced via ResumeEnhancementLog DB table.

### Rate Limiting (Phase 3)

lib/rate-limiter.ts provides a generic in-memory sliding-window rate limiter with configurable max/windowMs and periodic cleanup every 10 minutes. Used by: apply (10/min), job view (100/min). Throws TooManyRequestsError from lib/api-error.ts.

### Public Route Group (Phase 4)

(public) route group provides Navbar + Footer shell without affecting auth/role routes. Auth pages ((auth)) and role pages ((roles)) don't inherit this shell, avoiding double-navbar issues.

### Job Visibility Dual-Gate (Phase 4)

All public queries filter on both `status: "active"` (recruiter-controlled from Phase 2.3) AND `isActive: true` (admin kill-switch from Phase 1.4). Missing either filter silently leaks archived or admin-deactivated jobs. Applied in: listPublicJobs, sitemap dynamic entries, featured jobs.

### Auth-Aware Navbar & Redirect (Phase 4)

No centralized `getRoleHomeRoute` in a single lib file -- redirect logic handled via middleware (proxy.ts) and auth hooks. User role lands on /jobs (the marketplace). Admin/recruiter roles land on their respective dashboards. AccountPopover is role-aware with no "Dashboard" entry for users.

### JSON-LD Structured Data (Phase 4)

Injected via Next.js generateMetadata `other` object rather than raw script tags. All fields guarded by null checks -- no fabricated data. baseSalary only when salary data exists, jobLocation only when locations non-empty, employmentType only when non-null.

### Sitemap & Robots (Phase 4)

Sitemap: static entries for /, /jobs, /resources, /privacy, /terms + dynamic entries from prisma.job.findMany with dual-gate filter, ordered by updatedAt desc. Zero jobs -> valid sitemap with static entries only. Robots: disallows all crawlers on /admin, /recruiter, /user, /api.

---

## Active Global Context Snapshot

- **Mutations/Fetching:** REST route handlers for complex mutations; Server Actions only for plain forms. TanStack Query for all client-side data.
- **State Management:** Zustand strictly for UI client-state (sidebars, modals), never for API data.
- **Real-time:** Pusher with `private-thread-[id]` and `private-user-[id]` channels. Notifications via `lib/notifications.ts` shared utility (DB create + Pusher trigger in one call).
- **Route Guards:** Role-based middleware and layout-level protection. (public) group has no guards -- accessible to all.
- **Styling:** Tailwind v4 + Shadcn, theme variables, mobile-first responsive, motion/react for complex animations (<300ms).
- **Validation:** Zod v4 always. Schema.safeParse() before every DB write. All errors thrown from lib/api-error.ts.
- **Rate Limiting:** lib/rate-limiter.ts for apply (10/min) and view (100/min). AI resume enhancement: 5/day via DB ResumeEnhancementLog.
- **Resume Snapshot Architecture:** Apply-time snapshot in Application row survives resume deletion. Recruiters and applicants both see the submitted version.
- **Dual-Gate Job Visibility:** recruiter-controlled `status` + admin-controlled `isActive` -- all public queries filter on both.

---

## Known Issues / TODOs

- [ ] TODO: Replace mock upload (/api/upload) with S3/Vercel Blob in production.
- [x] TODO: Implement Pusher messaging backend -- DONE in Step 1.6 + Step 2.5.
- [ ] TODO: Add comprehensive tests once core features are stable.
- [ ] TODO: Run Prisma migration when database is reachable (`db.prisma.io:5432` unreachable).
- [ ] TODO: `form.watch()` triggers React Compiler `react-hooks/incompatible-library` warning -- project-wide pattern, not a regression.
- [ ] TODO: Pre-existing `react-pdf` CSS import error in `resume-preview-dialog.tsx` -- blocks `next build` but not `tsc`/`eslint`.
- [ ] TODO: Scheduled cleanup for soft-deleted resumes older than 60 days (verify no Application.resumeSnapshotUrl references before deleting files).
- [ ] TODO: Privacy Policy and Terms of Service pages contain placeholder legal text -- replace with counsel-reviewed copy before production launch.
- [ ] TODO: Promote csv-builder.ts from app/features/recruiter/libs/ to lib/ if reused outside recruiter scope.
- [ ] TODO: No centralized `getRoleHomeRoute` utility -- redirect logic is spread across middleware and auth hooks; consider centralising.

---

## Upcoming Dependencies

_(none -- all defined phases implemented)_
