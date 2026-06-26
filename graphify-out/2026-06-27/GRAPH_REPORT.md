# Graph Report - hire-flow-next  (2026-06-27)

## Corpus Check
- 248 files · ~75,440 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1276 nodes · 2527 edges · 91 communities (74 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `515e6652`
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

## God Nodes (most connected - your core abstractions)
1. `requireRole()` - 68 edges
2. `cn()` - 68 edges
3. `ok()` - 64 edges
4. `withErrorHandler()` - 30 edges
5. `ValidationError` - 27 edges
6. `apiClient()` - 24 edges
7. `auth` - 20 edges
8. `Button()` - 20 edges
9. `NotFoundError` - 18 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `handleDELETE()` --calls--> `ok()`  [INFERRED]
  app/api/admin/jobs/[id]/route.ts → lib/api-response.ts
- `handleDELETE()` --calls--> `ok()`  [INFERRED]
  app/api/admin/team/[id]/route.ts → lib/api-response.ts
- `handleDELETE()` --calls--> `ok()`  [INFERRED]
  app/api/admin/users/[id]/route.ts → lib/api-response.ts
- `handleDELETE()` --calls--> `ok()`  [INFERRED]
  app/api/recruiter/invite/[id]/route.ts → lib/api-response.ts
- `handleGET()` --calls--> `ok()`  [INFERRED]
  app/api/recruiter/jobs/[id]/route.ts → lib/api-response.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **hire-flow-next Technology Stack** — stack_nextjs, stack_prisma, stack_better_auth, stack_tanstack_query, stack_zustand, stack_tailwind, stack_shadcn, stack_zod, stack_react_hook_form, stack_motion [EXTRACTED 1.00]
- **Development Phases from Roadmap** — phase_foundation, phase_admin, phase_recruiter, phase_user, phase_public_jobs, phase_messaging_notifications [EXTRACTED 1.00]
- **Platform User Roles (RBAC)** — role_admin, role_recruiter, role_user [EXTRACTED 1.00]

## Communities (91 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (37): handlePOST(), POST, GET, handleGET(), GET, handleGET(), handlePOST(), POST (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (18): cn(), DataTable(), DataTableProps, SelectContent(), SelectGroup(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (36): 10. `app/(roles)/recruiter/messages/page.tsx`, 11. `app/(roles)/user/messages/page.tsx`, 12. `app/features/recruiter/components/applicants-table.tsx` — Add message action, 13. `app/features/recruiter/libs/rate-limit-message.ts`, 14. `lib/api-error.ts` — Add `TooManyRequestsError`, 15. `app/features/recruiter/components/applicants-table.tsx` — Add message column button, 16. `prisma/schema.prisma` — Add `applicationId` to `Message` model, 17. `app/(roles)/user/layout.tsx` — Verify user role layout exists (it should) (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (45): socialSignInAction(), AuthLayout(), AuthLayoutProps, FormButton(), FormButtonProps, FormInput(), FormInputProps, LoginForm() (+37 more)

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
Cohesion: 0.10
Nodes (16): ActionButton(), ActionButtonProps, capitalizeLabel(), formatLabel(), PeopleTableProps, ROLE_OPTIONS, UserRow, UsersApiResponse (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.27
Nodes (7): EMPLOYMENT_TYPE_OPTIONS, JobForm(), JobFormProps, WORK_MODE_OPTIONS, useCreateJob(), useUpdateJob(), Textarea()

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (30): geistMono, geistSans, inter, metadata, RootLayout(), Providers(), AdminTeamList(), JobDetail() (+22 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (8): inter, metadata, newFunction(), NotFound(), EditJobPage(), JobDetailPage(), ErrorPage(), ErrorPageType

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (21): Absolute Rules, Agent Rules (applied always), Commands, Core Routing (app/), Dependencies Protocol, Feature-Based Logic (`features/<name>/`), Forbidden, graphify (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.23
Nodes (12): ALLOWED_FILE_TYPES, getOtherUserId(), ThreadView(), ThreadViewProps, getPusherClient(), MessageItem, MessagesResponse, SendMessagePayload (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): metadata, AdminDashboard(), CHART_TOOLTIP_STYLE, WORKMODE_COLORS, useAdminDashboard(), Badge(), badgeVariants, ColumnDef (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.06
Nodes (20): metadata, metadata, metadata, metadata, Props, InviteAdminForm(), PageProps, PageHeader() (+12 more)

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (10): AdminInviteEmail(), AdminInviteEmailProps, button, buttonContainer, container, fallbackLink, heading, main (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Kilo-specific rules (+17 more)

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (23): Active Global Context Snapshot, Completed Steps, Created File Paths (Grouped by Phase), Hire Flow Next - Project Manifest, Known Issues / TODOs, Last Updated, Overview, Pending Dependencies (+15 more)

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
Cohesion: 0.21
Nodes (12): formatDateSeparator(), getDayKey(), ALLOWED_FILE_TYPES, getOtherUserId(), UserThreadView(), UserThreadViewProps, MessageItem, MessagesResponse (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 52 - "Community 52"
Cohesion: 0.11
Nodes (21): BulkInviteResult, metadata, InviteRecruiterForm(), Tab, RecruiterTeamList(), InviteListResponse, RecruiterInvite, RecruiterTeamMember (+13 more)

### Community 54 - "Community 54"
Cohesion: 0.11
Nodes (25): inviteRecruiter(), ResolvedSession, DELETE, handleDELETE(), DELETE, handleDELETE(), DELETE, handleDELETE() (+17 more)

### Community 55 - "Community 55"
Cohesion: 0.13
Nodes (23): BanDialog(), BanDialogProps, useBanUser(), useUnbanUser(), ConfirmActionButton(), ConfirmActionButtonProps, ConfirmDialog(), ConfirmDialogProps (+15 more)

### Community 56 - "Community 56"
Cohesion: 0.06
Nodes (35): AdminLayoutClient(), AcceptInviteClient(), AcceptInviteClientProps, metadata, Props, AdminLayout(), adminLinks, AdminSidebar() (+27 more)

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (12): TooManyRequestsError, buildCursorMeta(), parseCursorParams(), checkMessageRateLimit(), verifyRecruiterApplicantRelationship(), DELETE, GET, handleGET() (+4 more)

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (9): adapter, ADMIN, JOB_TEMPLATES, main(), pool, prisma, RECRUITERS, upsertCredentialAccount() (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.15
Nodes (15): BulkInviteResult, Tab, AdminAcceptInviteInput, AdminAcceptInviteSchema, AdminBanUserSchema, AdminBulkInviteFormInput, AdminBulkInviteFormSchema, AdminBulkInviteInput (+7 more)

### Community 60 - "Community 60"
Cohesion: 0.09
Nodes (34): ApplicantsTable(), ApplicantsTableProps, NEXT_ACTIONS, STATUS_OPTIONS, ConfirmStatusDialogProps, formatDateForInput(), InterviewFormData, OfferFormData (+26 more)

### Community 61 - "Community 61"
Cohesion: 0.18
Nodes (10): button, buttonContainer, container, fallbackLink, heading, main, paragraph, ResetPasswordEmail() (+2 more)

### Community 62 - "Community 62"
Cohesion: 0.14
Nodes (16): NotificationDropdown(), NotificationDropdownProps, notificationIconMap, NotificationItem, NotificationItem, NotificationsResponse, useMarkAsRead(), useNotifications() (+8 more)

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (9): scripts, build, demote, dev, lint, postinstall, promote, seed (+1 more)

### Community 65 - "Community 65"
Cohesion: 0.15
Nodes (9): DELETE, GET, handleDELETE(), handleGET(), DELETE, handleDELETE(), NotFoundError, GET (+1 more)

### Community 66 - "Community 66"
Cohesion: 0.16
Nodes (17): loginAction(), registerAction(), requestPasswordResetAction(), resetPasswordAction(), SocialProvider, { POST, GET }, validateWithZod(), ValidatorResult (+9 more)

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
Cohesion: 0.27
Nodes (7): upsertCompany(), metadata, CompanyForm(), CompanyFormProps, CompanyProfileInput, CompanyProfileOutput, CompanyProfileSchema

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (5): name, prisma, seed, private, version

### Community 73 - "Community 73"
Cohesion: 0.22
Nodes (9): GET, handleGET(), PATCH, getUnreadCount(), listNotifications(), NotificationItem, PaginatedResult, MarkNotificationsReadSchema (+1 more)

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (4): ConflictError, getApplicationById(), handlePATCH(), PATCH

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (3): ALLOWED_MIME_TYPES, UPLOAD_DIR, UploadResult

### Community 81 - "Community 81"
Cohesion: 0.22
Nodes (7): AdminMessagesPage(), ThreadListItem(), ThreadItem, ThreadLastMessage, ThreadUser, useAdminThreads(), formatTime()

### Community 82 - "Community 82"
Cohesion: 0.16
Nodes (17): AdminJobsTable(), AdminJobsTableProps, EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS, EMPLOYMENT_TYPE_LABELS, RecruiterJobsTable(), STATUS_BADGE, WORK_MODE_LABELS (+9 more)

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (7): DELETE, GET, handleDELETE(), handleGET(), handlePATCH(), PATCH, getJobById()

### Community 84 - "Community 84"
Cohesion: 0.19
Nodes (6): RecruiterMessagesPage(), ThreadItem, ThreadLastMessage, ThreadUser, useRecruiterThreads(), StartConversationSearch()

### Community 85 - "Community 85"
Cohesion: 0.13
Nodes (18): bulkInviteAdmins(), bulkInviteRecruiters(), inviteAdmin(), requireRole(), DELETE, handleDELETE(), handlePATCH(), PATCH (+10 more)

### Community 87 - "Community 87"
Cohesion: 0.21
Nodes (6): UserMessagesPage(), ApiEnvelope, UserThreadItem, UserThreadLastMessage, UserThreadUser, useUserThreads()

### Community 88 - "Community 88"
Cohesion: 0.23
Nodes (10): PeopleTable(), useAdminUsers(), useDeleteUser(), useRevokeUserSessions(), useSetUserRole(), AdminUserDetail, AdminUserListResult, AdminUserRow (+2 more)

### Community 89 - "Community 89"
Cohesion: 0.36
Nodes (7): AttachmentPreview(), AttachmentPreviewProps, fileIcon(), formatFileSize(), formatTime(), MessageBubble(), MessageBubbleProps

### Community 90 - "Community 90"
Cohesion: 0.25
Nodes (3): MessageItem, MessagesResponse, SendMessagePayload

## Knowledge Gaps
- **573 isolated node(s):** `Goal`, `Architecture Decisions`, `1. `app/features/recruiter/libs/verify-recruiter-applicant-relationship.ts``, `2. `app/api/recruiter/threads/route.ts` — List threads for recruiter`, `3. `app/api/recruiter/messages/[threadId]/route.ts` — Thread CRUD` (+568 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 9`, `Community 11`, `Community 12`, `Community 15`, `Community 48`, `Community 81`, `Community 16`, `Community 82`, `Community 84`, `Community 24`, `Community 55`, `Community 87`, `Community 56`, `Community 89`, `Community 60`, `Community 62`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `ok()` connect `Community 0` to `Community 65`, `Community 73`, `Community 74`, `Community 83`, `Community 85`, `Community 54`, `Community 57`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `requireRole()` connect `Community 85` to `Community 0`, `Community 65`, `Community 71`, `Community 74`, `Community 83`, `Community 54`, `Community 57`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `requireRole()` (e.g. with `handleDELETE()` and `handleDELETE()`) actually correct?**
  _`requireRole()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `ok()` (e.g. with `handleDELETE()` and `handleDELETE()`) actually correct?**
  _`ok()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Goal`, `Architecture Decisions`, `1. `app/features/recruiter/libs/verify-recruiter-applicant-relationship.ts`` to the rest of the system?**
  _573 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08446455505279035 - nodes in this community are weakly interconnected._