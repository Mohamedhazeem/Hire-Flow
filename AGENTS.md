---
description: hire-flow-next · Next.js 16 · React 19 · TS5 · Tailwind v4 · Shadcn UI · Motion · Lucid · Prisma 7/PG · Better Auth 1.6 · RHF 7 · Zod 4 · recharts · tanstack · zustand
---

# Agent Rules (applied always)

- **Retrieval-first:** Read `package.json`, `tsconfig.json`, `prisma/schema.prisma`, and relevant feature files before writing code. Always use graphify for query, Never invent APIs — verify against the installed version.
- **Shared assets** – Reuse the following; do not rebuild them:  
  (table of assets goes here, immediately after the rule)
- **All protected actions/routes must call `requireRole(...)`**
- **All errors must be thrown from `lib/api-error.ts`**

### Role Guard Requirement

Whenever you create a new protected Server Action or API Route, you MUST use this generic role guard (create it in `features/shared/api/require-role.ts` if it doesn't exist yet)

# STATE & CACHE RULES (short)

- **Startup:** Read `MANIFEST.md` and `HIRE_FLOW_PROMPTS.md` once; cache in‑memory. Report: Phase, Last Step, Next Step, Blockers.
- **Runtime:** Never re‑read MANIFEST and HIRE_FLOW_PROMPTS; use cache for step lookups.
- **Resync:** Re‑read only if user says they edited it manually.

# graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Phase 2 & 3

Phase 2 (Recruiter) and Phase 3 (User).
**Before implementing any feature from these phases, use `hire_flow_prompt.md`** from cache – it contains the step‑by‑step specifications, architecture constraints, and component lists.
Most of them share similar components and patterns from `admin`. so whenever you implement a feature from Phase 2 or 3, you should first check if the component already exists in and reuse.

## Stack

Framework: Next.js (App Router, Turbopack)
Styling: Tailwind v4 (`@theme` in `globals.css`, no config)
DB: Prisma + PostgreSQL
Auth: Better Auth + Prisma Adapter
Data fetching: TanStack Query (server-state & caching)
Client state: Zustand (UI store only – modals, sidebars)
Forms/Validation: RHF + Zod
Compiler: React Compiler (Automatic memoization)
Icons: react-icons
Animations: motion

## Absolute Rules

- **App Router only** — `app/` dir; never `pages/`
- **`params`/`searchParams` are Promises** in Next.js 16 — always `await` them
- **Server Components by default** — add `'use client'` only for hooks, events, or browser APIs
- **Server Actions = `'use server'`** — never call DB directly from Client Components
- **TypeScript strict** — no `any`; use `unknown` + Zod for external data; `import type` for type-only imports
- **Zod validates all input** before every DB write
- **Prisma = singleton** — import from `lib/prisma.ts` only; never `new PrismaClient()` inline
- **npm only** — never yarn/pnpm/bun
- **No secrets in source** — values in `.env.local`, names only in `.env.example`
- **Minimal scope** — touch only files required by the task; no renames, refactors, or dep upgrades unless asked
- **Don't Repeat Yourself (DRY) Styling** — If a task requires creating multiple forms or views that share structural wrappers, input styles, or button designs, preemptively extract them into shared primitives inside `components/ui/shared` or `components/ui/layout` or localized feature `components/`. Never copy-paste dense Tailwind utility chunks across files.

# Project Structure Rules

Strictly follow this directory structure. Do not create new top-level directories.

## Core Routing (app/)

- `(auth)/`: Public authentication routes (login, register, etc.)
- `(roles)/`: Protected dashboard routes grouped by `admin`, `recruiter`, `user`.
- `api/`: REST route handlers (DEFAULT for mutations).
- `features/`: Business logic, scoped by domain (e.g., `admin`, `auth`, `jobs`).

## Feature-Based Logic (`features/<name>/`)

- `actions/`: 'use server' (Form submissions only).
- `components/`: Co-located UI, client/server components.
- `queries/`: Server-side Prisma fetchers.
- `schema/`: Zod definitions and inferred TS types.
- `libs/`: Feature-specific utilities.
- `hooks/`: Client-side logic.

## Shared Layers

- `components/ui/`: Shadcn primitives.
- `lib/`: Global utilities (prisma.ts, auth.ts, validator.ts).
- `utils/`: Environment, logger, and global helpers.

Pages are thin orchestrators. All logic lives in `features/`.

## Naming

- Files/folders: `kebab-case`
- Components: `PascalCase` named exports
- Actions/queries: `camelCase` verb‑noun
- Zod schemas: `PascalCase + Schema`
- Inferred types: `PascalCase` via `z.infer`

## Key Patterns (enforce)

- Server Action: `'use server'` → `Schema.safeParse()` → DB write → `revalidatePath()` → `redirect()`
- Dynamic page: `params: Promise<{ id: string }>` → `await params`
- Form: `useForm<T>({ resolver: zodResolver(Schema) })`
- Route handler: only for auth webhooks or third‑party REST
- Middleware: `auth.api.getSession()` → redirect if no session
- Auth catch‑all: `app/api/auth/[...all]/route.ts` with `toNextJsHandler(auth)`
- Extract reusable inputs with `React.forwardRef` for RHF.
- Isolate shared wrappers into layout components.

## Theme & UI

- **Tailwind v4 tokens only** – never `[...]`; use `text-text-body`, `bg‑bg‑surface`, `p‑spacing‑4`, `rounded‑radius‑md` from `@theme`.
- **Lucide icons** from `'lucide-react'` with `size‑4`/`size‑5` and `strokeWidth={2}`.
- **Shadcn:** install via `npx shadcn@latest add`; map tokens in `globals.css` `@theme inline`.
- **Animations:** native Tailwind utilities for simple; Framer Motion (`motion.div`) only for complex orchestration, layoutId, AnimatePresence. Keep <300ms, prefer transform/opacity.

## Responsive Design (Mobile-First)

- **Mobile-first always** – base styles target 320px; use `sm:`(640), `md:`(768), `lg:`(1024) to scale up. Never desktop-first.
- **`min-w-0` on all flex children** that contain scrollable content. Flex items default to `min-width: auto` which prevents `overflow` from working.
- **Tables:** wrap in `overflow-x-auto` + parent must have `min-w-0`. `TableHead`/`TableCell` use `whitespace-nowrap` for horizontal scroll.
- **Actions:** labels go `hidden sm:inline` (icon-only on mobile). Pipe separators between action buttons: `hidden sm:inline`.
- **Forms/filters:** `flex-col sm:flex-row`; selects `w-full sm:w-36`. Buttons `w-full sm:w-auto`.
- **Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` pattern for cards; `md:grid-cols-2 lg:grid-cols-3` for charts.
- **Padding:** `px-4 md:px-6 lg:p-8` gradient across breakpoints.
- **Cards/modals:** padding `p-6 sm:p-8`; headings `text-2xl sm:text-3xl lg:text-4xl`.
- **Decorative blobs:** `hidden sm:block` to save GPU on mobile.
- **Touch targets:** ≥36px (`size-9`); `icon-xs` (24px) only in data tables where space is tight.
- **Admin layout:** `h-screen overflow-hidden` on outer flex → `flex-1 min-h-0 min-w-0 overflow-y-auto` on content.

## Shared Components Across Roles

- **Admin sidebar** (`admin-sidebar.tsx`): `AdminSidebar` is reusable for `recruiter`/`user` roles. Pass `links`, `role label`, `onSignOut` as props. Backdrop + slide-over on mobile (`max-lg:`), persistent on desktop (`lg:`). Uses `useUIStore` for open/close state.
- **Mobile menu button** (`mobile-menu-button.tsx`): `MobileMenuButton` is role-agnostic. Include in any role layout's hamburger row (`lg:hidden`).
- **Page header** (`components/layout/page-header.tsx`): `PageHeader` with `title`, `description`, `actions` slot. Use for all role dashboards.
- **Data table** (`components/ui/data-table.tsx`): `DataTable<T>` with `ColumnDef[]`. Use for all admin/recruiter/user listing pages.
- **UI primitives** (`components/ui/`): Button, Input, Select, Badge, Dialog, Skeleton, Popover, StatusBadge — shared across all roles.
- **Auth components** (`features/auth/components/`): `AuthLayout`, `LoginForm`, `SignUpForm`, `FormInput`, `FormButton` — shared across all auth pages.
- **Error page** (`components/error-page.tsx`): `ErrorPage` with `errorTag`, `title`, `description` — used by all unauthorized/error states.
- **When building recruiter/user layouts:** Use `RoleLayoutClient` from `components/layout/role-layout-client.tsx` and inject a `Sidebar` from `components/layout/sidebar.tsx` with role-specific `links`, `roleLabel`, `homeHref` props. Example: admin's `admin-layout-client.tsx` is now a thin wrapper around `<RoleLayoutClient sidebar={<AdminSidebar />}>`.

## Context Pack — Read Before Writing Any Code

Agent must `view`/`grep` these existing files first. Do not redefine anything found here.

- `components/layout/role-layout-client.tsx`, `components/layout/sidebar.tsx` — shared shell, accepts `messagesBasePath`.
- `app/(roles)/user/layout.tsx`, `app/(roles)/user/user-layout-client.tsx` — already wired with UserSidebar.
- `app/features/user/components/user-sidebar.tsx`, `user-messages-page.tsx`, `user-thread-view.tsx` — messaging already built.
- `app/features/user/hooks/messages/use-user-threads.ts`, `use-user-messages.ts`.
- `app/(roles)/user/messages/page.tsx`, `app/(roles)/user/notifications/page.tsx` — already built.
- `app/features/notifications/components/notifications-page.tsx`, `notification-dropdown.tsx`, `lib/notifications.ts` (`createNotification`, `createNotificationsBulk`, `triggerForCompany`) — reuse for every new notification trigger, never call `prisma.notification.create` directly.
- `lib/api-error.ts` / `lib/api-wrapper.ts` — `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `TooManyRequestsError`. Reuse, never throw raw `Error`.
- `lib/api-response.ts` (`ok`/`fail`), `lib/pagination.ts`, `lib/api-client.ts`, `lib/query-client.ts`.
- `lib/upload.ts`, `app/api/upload/route.ts` — mock upload provider (Phase 0.4).
- `app/api/files/download/route.ts` — auth-gated file proxy built in Phase 2.6 for resume access. **Resumes must go through this, never a raw public `/uploads/...` URL.**
- `components/ui/data-table.tsx` — already extended with `enableSelection`, `selectedIds`, `onSelectionChange`, `getRowId`, `disabledIds` (Phase 2.7). Reuse for any multi-select UI.
- `components/ui/status-badge.tsx`, `components/ui/skeleton.tsx`, `components/shared/status-timeline.tsx`, `components/shared/confirm-action-button.tsx`.
- `prisma/schema.prisma` — `ApplicationStatusChange` model (Phase 2.6) already logs every status transition. Reuse it for any "history" UI instead of inventing a parallel log.
- The `requireRole([...])` helper used throughout `app/features/recruiter/actions/*` — locate its real import path (do not redefine); use `requireRole(['user'])` everywhere below.
- Job model carries **two** independent gates: recruiter-controlled `status` (`draft|active|archived`, Phase 2.3) and admin-controlled `isActive` boolean kill-switch (Phase 1.4). Any public/user-facing query must filter on **both**.
- `app/features/recruiter/libs/csv-builder.ts` — promote to `lib/csv-builder.ts` if reused outside recruiter scope (see Step 3.4).
- `app/features/recruiter/libs/verify-recruiter-applicant-relationship.ts`, `compute-thread-id` util — reuse/generalize for user-initiated messaging in Step 3.5.

## Forbidden

- `pages/` · `new PrismaClient()` inline · `useEffect` for data
- `getServerSideProps` · synchronous `params` · `$queryRawUnsafe` / `$executeRawUnsafe`
- `deleteMany`/`updateMany` without explicit request · `fetch` in components
- Per‑component CSS · `any` type · `as` casts (except `unknown` narrowing)

## Dependencies Protocol

- Check `package.json` for exact version; read official docs before code generation.
- Placement: UI lib → `components/ui/` · email → `lib/email.ts` · uploads → `lib/upload.ts`.

## Commands

```bash
npm run dev|build|start|lint
npx prisma migrate dev --name <n> | generate | studio | db push
```

postinstall = prisma generate · build = prisma migrate deploy && next build

## Task Completion Gate

TypeScript passes · ESLint passes · no unused imports · no any · no dead code · no secrets · architecture followed.

## Output Constraints

- **Be concise** – shortest answer that fully resolves request.
- **Full files** for new files; for updates, output entire file or use // ... existing ... for boilerplate, but ensure copy‑paste‑able.
- **Ask** if file >150 lines: "Full or changes only?"
