# Graph Report - hire-flow-next  (2026-06-24)

## Corpus Check
- 146 files · ~40,676 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 747 nodes · 1242 edges · 67 communities (53 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `64ecce3e`
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
- [[_COMMUNITY_Community 49|Community 49]]
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 49 edges
2. `ok()` - 22 edges
3. `requireAdmin()` - 20 edges
4. `auth` - 17 edges
5. `compilerOptions` - 17 edges
6. `withErrorHandler()` - 13 edges
7. `ValidationError` - 12 edges
8. `What You Must Do When Invoked` - 12 edges
9. `Project Structure Rules` - 12 edges
10. `Button()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `StatusBadge()` --calls--> `cn()`  [EXTRACTED]
  components/ui/status-badge.tsx → lib/utils.ts
- `TableFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/table.tsx → lib/utils.ts
- `TableCaption()` --calls--> `cn()`  [EXTRACTED]
  components/ui/table.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **hire-flow-next Technology Stack** — stack_nextjs, stack_prisma, stack_better_auth, stack_tanstack_query, stack_zustand, stack_tailwind, stack_shadcn, stack_zod, stack_react_hook_form, stack_motion [EXTRACTED 1.00]
- **Development Phases from Roadmap** — phase_foundation, phase_admin, phase_recruiter, phase_user, phase_public_jobs, phase_messaging_notifications [EXTRACTED 1.00]
- **Platform User Roles (RBAC)** — role_admin, role_recruiter, role_user [EXTRACTED 1.00]

## Communities (67 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (22): requireAdmin(), handlePOST(), POST, GET, GET, ok(), withErrorHandler(), getSession() (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (15): cn(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), SelectContent(), SelectGroup(), SelectItem() (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (11): ApiError, UnauthorizedError, fail(), ERROR_STATUS_MAP, handleError(), ParamHandler, RouteContext, SimpleHandler (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (32): AdminInviteEmail(), AdminInviteEmailProps, button, buttonContainer, container, fallbackLink, heading, main (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (22): Analytics - aggregated counts and charts (admin/recruiter), Applications - user applies, status tracking, Job Posts - title, description, locations, skills, etc., Messaging - real-time chat per thread, Notifications - in-app toast/bell system, extraction-spec.md - Subagent Prompt Template, graphify CLI - knowledge graph extraction tool, HIRE_FLOW_PROMPTS.md - Project Spec & Roadmap (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (17): bulkInviteAdmins(), BulkInviteResult, inviteAdmin(), InviteAdminForm(), Tab, ForbiddenError, sendEmail(), AdminAcceptInviteInput (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (17): devDependencies, babel-plugin-react-compiler, cross-env, eslint, eslint-config-next, eslint-plugin-react-hooks, prisma, tailwindcss (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (31): dependencies, @base-ui/react, better-auth, @better-auth/prisma-adapter, class-variance-authority, clsx, date-fns, debug (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (17): metadata, AdminDashboard(), StatCardProps, WORKMODE_COLORS, AdminTeamList(), useAdminDashboard(), AdminInvite, AdminTeamMember (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (10): AdminLayout(), AdminSidebar(), sidebarLinks, RecruiterLayout(), PersistedState, Theme, UIStore, useUIStore (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (24): geistMono, geistSans, inter, metadata, RootLayout(), Providers(), apiClient(), buildOffsetMeta() (+16 more)

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (6): inter, metadata, newFunction(), NotFound(), ErrorPage(), ErrorPageType

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (17): Absolute Rules, Commands, Core Routing (app/), Dependencies Protocol, Feature-Based Logic (`features/<name>/`), Forbidden, graphify, hire-flow-next — Agent Rules (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (15): BanDialog(), BanDialogProps, useBanUser(), useUnbanUser(), Button(), buttonVariants, Dialog(), DialogClose() (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (9): { POST, GET }, adapter, globalForPrisma, pool, auth, UserStatusResult, env, envSchema (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (10): AdminJobsTable(), AdminJobsTableProps, ApiResponse, useAdminJobs(), useDeleteJob(), useToggleJobStatus(), metadata, AdminJobListResult (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (5): AcceptInviteClient(), AcceptInviteClientProps, metadata, Props, authClient

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Kilo-specific rules (+17 more)

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (21): 🧠 Active Global Context Snapshot, ✅ Completed Steps, 📁 Created File Paths (Grouped by Phase), Hire Flow Next – Project Manifest, 🐛 Known Issues / TODOs, 📅 Last Updated, 📊 Overview, 🔗 Pending Dependencies (+13 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (12): 1. Dependencies & Configuration, 2. Unit Tests (Server Actions & Helpers), 3. Integration Tests (REST API Routes), 4. Integration Tests (Server Actions from the UI), 5. Component Tests (React Testing Library), 6. End‑to‑End Tests (Playwright), 7. Code Coverage, 8. CI / GitHub Actions (Optional but recommended) (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (10): Begin your output now., **CLAUDE OUTPUT REFINE WITH GEMENI**, Current project setup:, **DEEPSEAK PROMPT:**, My details:, PROJECT CONTEXT, Step 0.6: TanStack Query Provider & Zustand Stores, Step 0.7: Project Manifest (Agent Memory) (+2 more)

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
Cohesion: 0.11
Nodes (15): SocialProvider, socialSignInAction(), providers, SocialProvider, adapter, ADMIN, JOB_TEMPLATES, main() (+7 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (17): AuthLayout(), AuthLayoutProps, FormButton(), FormButtonProps, FormInput(), FormInputProps, LoginForm(), LoginFormProps (+9 more)

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 52 - "Community 52"
Cohesion: 0.31
Nodes (5): resetPasswordAction(), ResetPasswordForm(), ResetPasswordInput, metadata, ResetPasswordSchema

### Community 53 - "Community 53"
Cohesion: 0.40
Nodes (8): loginAction(), registerAction(), requestPasswordResetAction(), validateWithZod(), ValidatorResult, verifyUserStatus(), ActionResult, authError()

### Community 54 - "Community 54"
Cohesion: 0.24
Nodes (10): PeopleTable(), PeopleTableProps, ROLE_OPTIONS, useAdminUsers(), useDeleteUser(), useRevokeUserSessions(), useSetUserRole(), Badge() (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.21
Nodes (10): AuthRedirectTargetType, AuthType, ForgotPasswordType, LoginInputType, RegisterInputType, ResetPasswordType, Session, SessionCredentials (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (9): DataTableProps, Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead(), TableHeader() (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.27
Nodes (7): requireSuperAdmin(), DELETE, GET, handleDELETE(), handleGET(), PATCH, getUserById()

### Community 58 - "Community 58"
Cohesion: 0.24
Nodes (6): disposableSet, emailSchema, ForgotPasswordSchema, PasswordSchema, Roles, RoleType

### Community 59 - "Community 59"
Cohesion: 0.22
Nodes (4): POST, DELETE, NotFoundError, AdminAcceptInviteSchema

### Community 60 - "Community 60"
Cohesion: 0.28
Nodes (4): PageHeader(), PageHeaderProps, metadata, metadata

### Community 61 - "Community 61"
Cohesion: 0.22
Nodes (9): scripts, build, demote, dev, lint, postinstall, promote, seed (+1 more)

### Community 62 - "Community 62"
Cohesion: 0.32
Nodes (6): authPages, config, protectedRoutes, proxy(), getRedirectPath(), VerifyEmailPage()

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (5): GET, handleGET(), ValidationError, listJobs(), AdminListJobsParamsSchema

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (5): name, prisma, seed, private, version

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (5): ApplicationStatus, STATUS_MAP, StatusBadge(), StatusBadgeProps, StatusConfig

### Community 66 - "Community 66"
Cohesion: 0.50
Nodes (3): ALLOWED_MIME_TYPES, UPLOAD_DIR, UploadResult

## Knowledge Gaps
- **359 isolated node(s):** `📅 Last Updated`, `📊 Overview`, `Phase 0: Foundation`, `Phase 1: Admin`, `Phase 2: Recruiter` (+354 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 65`, `Community 9`, `Community 11`, `Community 12`, `Community 15`, `Community 54`, `Community 56`, `Community 60`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 15` to `Community 1`, `Community 5`, `Community 9`, `Community 48`, `Community 54`, `Community 24`, `Community 28`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `auth` connect `Community 16` to `Community 0`, `Community 11`, `Community 13`, `Community 47`, `Community 52`, `Community 53`, `Community 57`, `Community 62`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `📅 Last Updated`, `📊 Overview`, `Phase 0: Foundation` to the rest of the system?**
  _359 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06031746031746032 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._