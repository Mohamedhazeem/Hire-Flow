# Graph Report - hire-flow-next  (2026-06-27)

## Corpus Check
- 264 files · ~83,776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1394 nodes · 2852 edges · 106 communities (89 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `317c952a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]

## God Nodes (most connected - your core abstractions)
1. `requireRole()` - 85 edges
2. `ok()` - 81 edges
3. `cn()` - 78 edges
4. `withErrorHandler()` - 37 edges
5. `ValidationError` - 32 edges
6. `apiClient()` - 25 edges
7. `Button()` - 23 edges
8. `NotFoundError` - 22 edges
9. `auth` - 20 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `handleDELETE()` --calls--> `ok()`  [INFERRED]
  app/api/admin/team/[id]/route.ts → lib/api-response.ts
- `handleDELETE()` --calls--> `ok()`  [INFERRED]
  app/api/admin/users/[id]/route.ts → lib/api-response.ts
- `handlePATCH()` --calls--> `ok()`  [EXTRACTED]
  app/api/notifications/route.ts → lib/api-response.ts
- `handleDELETE()` --calls--> `ok()`  [INFERRED]
  app/api/recruiter/invite/[id]/route.ts → lib/api-response.ts
- `handlePOST()` --calls--> `ok()`  [INFERRED]
  app/api/recruiter/invite/accept/route.ts → lib/api-response.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **hire-flow-next Technology Stack** — stack_nextjs, stack_prisma, stack_better_auth, stack_tanstack_query, stack_zustand, stack_tailwind, stack_shadcn, stack_zod, stack_react_hook_form, stack_motion [EXTRACTED 1.00]
- **Development Phases from Roadmap** — phase_foundation, phase_admin, phase_recruiter, phase_user, phase_public_jobs, phase_messaging_notifications [EXTRACTED 1.00]
- **Platform User Roles (RBAC)** — role_admin, role_recruiter, role_user [EXTRACTED 1.00]

## Communities (106 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (25): handlePOST(), POST, handlePOST(), POST, DELETE, handleDELETE(), GET, handleGET() (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.24
Nodes (14): cn(), Checkbox(), DataTableProps, DialogOverlay(), StatCard(), StatCardProps, Table(), TableBody() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (36): 10. `app/(roles)/recruiter/messages/page.tsx`, 11. `app/(roles)/user/messages/page.tsx`, 12. `app/features/recruiter/components/applicants-table.tsx` — Add message action, 13. `app/features/recruiter/libs/rate-limit-message.ts`, 14. `lib/api-error.ts` — Add `TooManyRequestsError`, 15. `app/features/recruiter/components/applicants-table.tsx` — Add message column button, 16. `prisma/schema.prisma` — Add `applicationId` to `Message` model, 17. `app/(roles)/user/layout.tsx` — Verify user role layout exists (it should) (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (23): socialSignInAction(), AuthLayout(), AuthLayoutProps, FormButton(), FormButtonProps, FormInput(), FormInputProps, LoginForm() (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.40
Nodes (5): extraction-spec.md - Subagent Prompt Template, graphify CLI - knowledge graph extraction tool, query.md - Graph Traversal & Query, graphify SKILL.md - Graph Extraction Skill, update.md - Incremental Update & Cluster-Only

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (23): 10. `app/(roles)/recruiter/jobs/page.tsx`, 11. `app/(roles)/recruiter/jobs/new/page.tsx`, 12. `app/(roles)/recruiter/jobs/[id]/page.tsx`, 13. `app/(roles)/recruiter/jobs/[id]/edit/page.tsx`, 1. `app/features/recruiter/schema/job.schema.ts`, 2. `app/features/recruiter/queries/job-queries.ts`, 3. `app/features/recruiter/hooks/use-recruiter-jobs.ts`, 4. `app/features/recruiter/components/job-form.tsx` (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (17): devDependencies, babel-plugin-react-compiler, cross-env, eslint, eslint-config-next, eslint-plugin-react-hooks, prisma, tailwindcss (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (33): dependencies, @base-ui/react, better-auth, @better-auth/prisma-adapter, class-variance-authority, clsx, date-fns, debug (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (8): ActionButton(), ActionButtonProps, capitalizeLabel(), formatLabel(), PeopleTableProps, ROLE_OPTIONS, UserRow, UsersApiResponse

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (16): metadata, JobForm(), RecruiterJobsTable(), PageProps, useCreateJob(), useDeleteJob(), useRecruiterJobs(), useToggleJobStatus() (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (8): geistMono, geistSans, inter, metadata, RootLayout(), Providers(), getQueryClient(), makeQueryClient()

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (8): inter, metadata, newFunction(), NotFound(), EditJobPage(), JobDetailPage(), ErrorPage(), ErrorPageType

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (21): Absolute Rules, Agent Rules (applied always), Commands, Core Routing (app/), Dependencies Protocol, Feature-Based Logic (`features/<name>/`), Forbidden, graphify (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (20): AttachmentPreview(), AttachmentPreviewProps, fileIcon(), formatDateSeparator(), formatFileSize(), formatTime(), getDayKey(), MessageBubble() (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (13): metadata, AdminDashboard(), CHART_TOOLTIP_STYLE, WORKMODE_COLORS, useAdminDashboard(), ConfirmActionButton(), ConfirmActionButtonProps, ConfirmDialog() (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (12): metadata, metadata, Props, InviteRecruiterForm(), JobDetail(), PageProps, PageHeader(), PageHeaderProps (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (10): AdminInviteEmail(), AdminInviteEmailProps, button, buttonContainer, container, fallbackLink, heading, main (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Kilo-specific rules (+17 more)

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (25): Active Global Context Snapshot, Completed Steps, Created File Paths (Grouped by Phase), Hire Flow Next - Project Manifest, Known Issues / TODOs, Last Updated, Overview, Pending Dependencies (+17 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (12): 1. Dependencies & Configuration, 2. Unit Tests (Server Actions & Helpers), 3. Integration Tests (REST API Routes), 4. Integration Tests (Server Actions from the UI), 5. Component Tests (React Testing Library), 6. End‑to‑End Tests (Playwright), 7. Code Coverage, 8. CI / GitHub Actions (Optional but recommended) (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.08
Nodes (25): Begin your output now., **CLAUDE OUTPUT REFINE WITH GEMENI**, Core Principles & Constraints, Current project setup:, **DEEPSEAK PROMPT:**, My details:, Phase 2: Recruiter Portal – Implementation Guide for AI Agent, Phase 3: User (+17 more)

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (5): GitHub Copilot Instructions, graphify, Mandatory Retrieval, Primary Instruction Source, Rule

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 39 - "Community 39"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "Community 40"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 41 - "Community 41"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 47 - "Community 47"
Cohesion: 0.16
Nodes (16): listJobs(), listJobs(), buildOffsetMeta(), CursorPaginationMeta, CursorPaginationParams, OffsetPaginationMeta, OffsetPaginationParams, parseOffsetParams() (+8 more)

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (11): ALLOWED_FILE_TYPES, getOtherUserId(), UserThreadView(), UserThreadViewProps, getPusherClient(), MessageItem, MessagesResponse, SendMessagePayload (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (12): bulkInviteRecruiters(), BulkInviteResult, inviteRecruiter(), Tab, RecruiterAcceptInviteInput, RecruiterAcceptInviteSchema, RecruiterBulkInviteFormInput, RecruiterBulkInviteFormSchema (+4 more)

### Community 54 - "Community 54"
Cohesion: 0.16
Nodes (14): bulkInviteAdmins(), inviteAdmin(), SocialProvider, { POST, GET }, getSession(), resend, sendEmail(), SendEmailArgs (+6 more)

### Community 55 - "Community 55"
Cohesion: 0.16
Nodes (23): AdminJobsTableProps, EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS, BanDialog(), BanDialogProps, BulkRejectDialogProps, RevertDialogProps, useBanUser() (+15 more)

### Community 56 - "Community 56"
Cohesion: 0.18
Nodes (7): AcceptInviteClient(), AcceptInviteClientProps, metadata, Props, LogoutButton(), authClient, metadata

### Community 57 - "Community 57"
Cohesion: 0.11
Nodes (21): DELETE, GET, handleDELETE(), handleGET(), handlePOST(), messageSelect, POST, SendMessageSchema (+13 more)

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (9): adapter, ADMIN, JOB_TEMPLATES, main(), pool, prisma, RECRUITERS, upsertCredentialAccount() (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.11
Nodes (19): BulkInviteResult, metadata, InviteAdminForm(), Tab, BulkEmailsInput, BulkEmailsSchema, AdminAcceptInviteInput, AdminAcceptInviteSchema (+11 more)

### Community 60 - "Community 60"
Cohesion: 0.09
Nodes (30): ApplicantDetailPageProps, NEXT_ACTIONS, ApplicantsTableProps, BULK_ACTION_LABELS, BulkActionDef, NEXT_ACTIONS, STATUS_DOT_COLORS, STATUS_OPTIONS (+22 more)

### Community 61 - "Community 61"
Cohesion: 0.18
Nodes (10): button, buttonContainer, container, fallbackLink, heading, main, paragraph, ResetPasswordEmail() (+2 more)

### Community 62 - "Community 62"
Cohesion: 0.15
Nodes (16): NotificationDropdown(), NotificationDropdownProps, notificationIconMap, NotificationItem, NotificationItem, NotificationsResponse, useMarkAsRead(), useNotifications() (+8 more)

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (9): scripts, build, demote, dev, lint, postinstall, promote, seed (+1 more)

### Community 65 - "Community 65"
Cohesion: 0.16
Nodes (24): loginAction(), registerAction(), requestPasswordResetAction(), resetPasswordAction(), validateWithZod(), ValidatorResult, auth, UserStatusResult (+16 more)

### Community 66 - "Community 66"
Cohesion: 0.13
Nodes (14): upsertCompany(), ResolvedSession, DELETE, handleDELETE(), DELETE, handleDELETE(), DELETE, handleDELETE() (+6 more)

### Community 67 - "Community 67"
Cohesion: 0.22
Nodes (8): BanNotificationEmail(), BanNotificationEmailProps, container, heading, main, noteBox, noteText, paragraph

### Community 68 - "Community 68"
Cohesion: 0.08
Nodes (25): 10. `app/features/admin/hooks/messages/use-admin-messages.ts` — Add refetchInterval, 11. `app/features/admin/components/thread-view.tsx` — Subscribe to realtime messages, 12. `components/layout/role-layout-client.tsx` — Mount NotificationDropdown, 1. `lib/pusher.ts` — Server-side singleton, 2. `lib/pusher-client.ts` — Client-side lazy singleton, 3. `app/api/pusher/auth/route.ts` — Private channel auth, 4. `app/features/notifications/schema/notification.schema.ts`, 5. `app/features/notifications/queries/notification-queries.ts` (+17 more)

### Community 69 - "Community 69"
Cohesion: 0.18
Nodes (10): button, buttonContainer, container, fallbackLink, heading, main, paragraph, RecruiterInviteEmail() (+2 more)

### Community 70 - "Community 70"
Cohesion: 0.18
Nodes (10): button, buttonContainer, container, fallbackLink, heading, main, paragraph, separatorText (+2 more)

### Community 71 - "Community 71"
Cohesion: 0.24
Nodes (5): metadata, CompanyForm(), CompanyProfileInput, CompanyProfileOutput, CompanyProfileSchema

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (5): name, prisma, seed, private, version

### Community 73 - "Community 73"
Cohesion: 0.22
Nodes (10): GET, handleGET(), handlePATCH(), PATCH, getUnreadCount(), listNotifications(), NotificationItem, PaginatedResult (+2 more)

### Community 74 - "Community 74"
Cohesion: 0.13
Nodes (18): CompanyFormProps, EMPLOYMENT_TYPE_OPTIONS, JobFormProps, WORK_MODE_OPTIONS, EMPLOYMENT_TYPE_LABELS, STATUS_BADGE, WORK_MODE_LABELS, Input() (+10 more)

### Community 75 - "Community 75"
Cohesion: 0.24
Nodes (7): UnauthorizedError, ALLOWED_MIME_TYPES, saveUpload(), UPLOAD_DIR, UploadResult, handlePOST(), POST

### Community 81 - "Community 81"
Cohesion: 0.11
Nodes (18): `app/api/recruiter/applications/bulk/status/route.ts` — New bulk API route, `app/features/recruiter/components/applicant-detail-page.tsx` — No change, `app/features/recruiter/components/applicants-table.tsx` — Add selection + bulk action bar, `app/features/recruiter/components/application-dialogs.tsx` — Add BulkRejectDialog, `app/features/recruiter/hooks/use-applications.ts` — Add bulk mutation hook, `app/features/recruiter/schema/application.schema.ts` — Add bulk schemas, Checklist, `components/ui/data-table.tsx` — Add optional row selection (+10 more)

### Community 82 - "Community 82"
Cohesion: 0.32
Nodes (7): AdminTeamList(), AdminInvite, AdminTeamMember, InviteListResponse, useAdminInvites(), useCancelInvite(), useRemoveAdmin()

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (7): DELETE, GET, handleDELETE(), handleGET(), handlePATCH(), PATCH, getJobById()

### Community 84 - "Community 84"
Cohesion: 0.21
Nodes (6): RecruiterMessagesPage(), ThreadListItem(), ThreadItem, ThreadLastMessage, ThreadUser, useRecruiterThreads()

### Community 85 - "Community 85"
Cohesion: 0.09
Nodes (31): requireRole(), GET, handleGET(), DELETE, handleDELETE(), handlePATCH(), PATCH, GET (+23 more)

### Community 86 - "Community 86"
Cohesion: 0.14
Nodes (17): ApplicantsTable(), useApplicants(), useBulkTransitionStatus(), useRevertStatus(), ApplicantListResult, APPLICATION_STATUSES, ApplicationStatusSchema, baseTransitionSchema (+9 more)

### Community 87 - "Community 87"
Cohesion: 0.21
Nodes (7): ThreadListItem(), UserMessagesPage(), UserThreadItem, UserThreadLastMessage, UserThreadUser, useUserThreads(), formatTime()

### Community 88 - "Community 88"
Cohesion: 0.23
Nodes (10): PeopleTable(), useAdminUsers(), useDeleteUser(), useRevokeUserSessions(), useSetUserRole(), AdminUserDetail, AdminUserListResult, AdminUserRow (+2 more)

### Community 89 - "Community 89"
Cohesion: 0.10
Nodes (28): AdminLayoutClient(), AdminLayout(), adminLinks, AdminSidebar(), recruiterLinks, RecruiterSidebar(), userLinks, UserSidebar() (+20 more)

### Community 90 - "Community 90"
Cohesion: 0.25
Nodes (3): MessageItem, MessagesResponse, SendMessagePayload

### Community 91 - "Community 91"
Cohesion: 0.09
Nodes (21): 1. One-Time Bulk Action Constraint (per session), 2. Revert Mechanism (per-row), 3. Color-Coded Status Filter Tags, 4. Visual Feedback on Bulk Actions, 5. One-Time Constraint on Single (Inline) Actions Too, `app/api/recruiter/applications/[applicationId]/revert/route.ts` (NEW), `app/features/recruiter/components/applicants-table.tsx`, `app/features/recruiter/components/revert-dialog.tsx` (NEW) (+13 more)

### Community 92 - "Community 92"
Cohesion: 0.15
Nodes (10): ApiEnvelope, AdminMessagesPage(), ThreadListItem(), ThreadItem, ThreadLastMessage, ThreadUser, useAdminThreads(), SearchResult (+2 more)

### Community 93 - "Community 93"
Cohesion: 0.22
Nodes (6): JobDetailProps, STATUS_BADGE, ApiResponse, DashboardStats, getDashboardStats(), RecruiterJobDetail

### Community 94 - "Community 94"
Cohesion: 0.22
Nodes (5): Props, STATUS_COLORS, STATUS_ICONS, StatusTimeline(), StatusTimelineEntry

### Community 95 - "Community 95"
Cohesion: 0.18
Nodes (10): authPages, config, protectedRoutes, proxy(), AuthRedirectTargetType, User, UserCredentials, Roles (+2 more)

### Community 96 - "Community 96"
Cohesion: 0.15
Nodes (9): GET, handleGET(), GET, handleGET(), MIME_MAP, UPLOAD_DIR, ValidationError, GET (+1 more)

### Community 97 - "Community 97"
Cohesion: 0.32
Nodes (4): metadata, Props, ApplicantDetailSkeleton(), Skeleton()

### Community 98 - "Community 98"
Cohesion: 0.12
Nodes (13): GET, handleGET(), ApiError, ConflictError, TooManyRequestsError, getApplicantDetail(), STATUS_LABELS, getApplicationById() (+5 more)

### Community 99 - "Community 99"
Cohesion: 0.40
Nodes (3): AcceptInviteClient(), metadata, Props

### Community 100 - "Community 100"
Cohesion: 0.32
Nodes (5): metadata, AdminJobsTable(), useAdminJobs(), useDeleteJob(), useToggleJobStatus()

### Community 101 - "Community 101"
Cohesion: 0.32
Nodes (7): RecruiterTeamList(), InviteListResponse, RecruiterInvite, RecruiterTeamMember, useCancelInvite(), useRecruiterInvites(), useRemoveMember()

### Community 103 - "Community 103"
Cohesion: 0.39
Nodes (5): apiClient(), DEFAULT_QUERY_OPTIONS, defaultQueryFn(), QueryKeyShape, toAbsoluteUrl()

### Community 104 - "Community 104"
Cohesion: 0.40
Nodes (5): DELETE, GET, handleDELETE(), handleGET(), getUserById()

### Community 105 - "Community 105"
Cohesion: 0.40
Nodes (5): ApplicantDetailPage(), useApplicantDetail(), useTransitionStatusWithRefresh(), ApplicantDetailResponse, StatusTransitionInput

## Knowledge Gaps
- **635 isolated node(s):** `$schema`, `plugin`, `@kilocode/plugin`, `AcceptInviteClientProps`, `Props` (+630 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 9`, `Community 74`, `Community 12`, `Community 15`, `Community 92`, `Community 48`, `Community 16`, `Community 84`, `Community 94`, `Community 86`, `Community 87`, `Community 24`, `Community 89`, `Community 55`, `Community 60`, `Community 62`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `requireRole()` connect `Community 85` to `Community 96`, `Community 0`, `Community 66`, `Community 98`, `Community 104`, `Community 83`, `Community 52`, `Community 54`, `Community 57`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 55` to `Community 1`, `Community 3`, `Community 99`, `Community 9`, `Community 74`, `Community 16`, `Community 52`, `Community 56`, `Community 59`, `Community 60`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `requireRole()` (e.g. with `handleDELETE()` and `handleDELETE()`) actually correct?**
  _`requireRole()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `ok()` (e.g. with `handleDELETE()` and `handleDELETE()`) actually correct?**
  _`ok()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugin`, `@kilocode/plugin` to the rest of the system?**
  _635 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1021021021021021 - nodes in this community are weakly interconnected._