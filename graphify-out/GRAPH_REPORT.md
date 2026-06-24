# Graph Report - hire-flow-next  (2026-06-24)

## Corpus Check
- 115 files · ~32,747 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 511 nodes · 853 edges · 32 communities (21 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `05891f9e`
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
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 48 edges
2. `auth` - 17 edges
3. `ok()` - 17 edges
4. `compilerOptions` - 17 edges
5. `requireAdmin()` - 16 edges
6. `Project Structure Rules` - 12 edges
7. `hire-flow-next: Job Board Platform` - 12 edges
8. `verifyUserStatus()` - 9 edges
9. `getRedirectPath()` - 9 edges
10. `validateWithZod()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `getRedirectPath()`  [EXTRACTED]
  proxy.ts → app/features/auth/utils/getRedirectPath.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `PageHeader()` --calls--> `cn()`  [EXTRACTED]
  components/layout/page-header.tsx → lib/utils.ts
- `DataTable()` --calls--> `cn()`  [EXTRACTED]
  components/ui/data-table.tsx → lib/utils.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **hire-flow-next Technology Stack** — stack_nextjs, stack_prisma, stack_better_auth, stack_tanstack_query, stack_zustand, stack_tailwind, stack_shadcn, stack_zod, stack_react_hook_form, stack_motion [EXTRACTED 1.00]
- **Development Phases from Roadmap** — phase_foundation, phase_admin, phase_recruiter, phase_user, phase_public_jobs, phase_messaging_notifications [EXTRACTED 1.00]
- **Platform User Roles (RBAC)** — role_admin, role_recruiter, role_user [EXTRACTED 1.00]

## Communities (32 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (53): loginAction(), registerAction(), requestPasswordResetAction(), resetPasswordAction(), SocialProvider, socialSignInAction(), AuthLayout(), AuthLayoutProps (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (44): PageHeader(), PageHeaderProps, cn(), Badge(), badgeVariants, Button(), buttonVariants, ColumnDef (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (37): { POST, GET }, requireAdmin(), handlePOST(), POST, DELETE, GET, handleDELETE(), handleGET() (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (29): LogoutButton(), button, buttonContainer, container, fallbackLink, heading, main, paragraph (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (23): Analytics - aggregated counts and charts (admin/recruiter), Applications - user applies, status tracking, Job Posts - title, description, locations, skills, etc., Messaging - real-time chat per thread, Notifications - in-app toast/bell system, extraction-spec.md - Subagent Prompt Template, graphify CLI - knowledge graph extraction tool, HIRE_FLOW_PROMPTS.md - Project Spec & Roadmap (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (17): buildOffsetMeta(), CursorPaginationMeta, CursorPaginationParams, OffsetPaginationMeta, OffsetPaginationParams, parseOffsetParams(), adapter, globalForPrisma (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (30): devDependencies, babel-plugin-react-compiler, cross-env, eslint, eslint-config-next, eslint-plugin-react-hooks, prisma, tailwindcss (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (31): dependencies, @base-ui/react, better-auth, @better-auth/prisma-adapter, class-variance-authority, clsx, date-fns, debug (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (9): adapter, ADMIN, JOB_TEMPLATES, main(), pool, prisma, RECRUITERS, upsertCredentialAccount() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (11): AdminLayout(), authPages, config, protectedRoutes, proxy(), RecruiterLayout(), Roles, RoleSchema (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (14): geistMono, geistSans, inter, metadata, RootLayout(), Providers(), apiClient(), ApiError (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (6): inter, metadata, newFunction(), NotFound(), ErrorPage(), ErrorPageType

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (17): Absolute Rules, Commands, Core Routing (app/), Dependencies Protocol, Feature-Based Logic (`features/<name>/`), Forbidden, graphify, hire-flow-next — Agent Rules (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): PersistedState, Theme, UIStore, useUIStore

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): ALLOWED_MIME_TYPES, UPLOAD_DIR, UploadResult

## Knowledge Gaps
- **233 isolated node(s):** `STATE & CACHE RULES (short)`, `graphify`, `Stack`, `Absolute Rules`, `Core Routing (app/)` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 12`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `auth` connect `Community 2` to `Community 0`, `Community 11`, `Community 13`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `STATE & CACHE RULES (short)`, `graphify`, `Stack` to the rest of the system?**
  _233 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.056329113924050635 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09545454545454546 - nodes in this community are weakly interconnected._