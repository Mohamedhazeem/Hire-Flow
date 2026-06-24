---
description: hire-flow-next · Next.js 16 · React 19 · TS5 · Tailwind v4 · Shadcn UI · Motion · Lucid · Prisma 7/PG · Better Auth 1.6 · RHF 7 · Zod 4 · recharts · tanstack · zustand
---

# Agent Rules (applied always)

- **Retrieval-first:** Read `package.json`, `tsconfig.json`, `prisma/schema.prisma`, and relevant feature files before writing code. Never invent APIs — verify against the installed version.
- **Shared assets** – Reuse the following; do not rebuild them:  
  (table of assets goes here, immediately after the rule)
- **All protected actions/routes must call `requireRole(...)`**
- **All errors must be thrown from `lib/api-error.ts`**

### Role Guard Requirement

Whenever you create a new protected Server Action or API Route, you MUST use this generic role guard (create it in `features/shared/api/require-role.ts` if it doesn't exist yet)

# STATE & CACHE RULES (short)

- **Startup:** Read `MANIFEST.md` once; cache in‑memory. Report: Phase, Last Step, Next Step, Blockers.
- **Runtime:** Never re‑read MANIFEST; use cache for step lookups.
- **Updates:** Update cache + write to disk after **every** completed step; bump `Last Updated`.
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

# Agent Instructions

## Global Coding Rules & Shared Infrastructure

Do not reinvent the wheel. You must reuse the following assets for all upcoming tasks and create re-usable components and patterns for future tasks:

| Asset                  | Path                                          | Purpose                                                                   |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| Standardised errors    | `lib/api-error.ts`                            | `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ValidationError` |
| Data table             | `components/data-table.tsx`                   | Reusable table with sorting, pagination, debounced search                 |
| React Email pipeline   | `features/auth/libs/email.ts`                 | Used to send all transactional emails                                     |
| URL search params      | Admin search reads/writes `searchParams`      | **Mandatory** for all filterable lists – never use `useState`             |
| Bulk operation pattern | `features/admin/actions/bulk-invite-admin.ts` | Extend for bulk status updates, bulk reject, etc.                         |

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
- **Don't Repeat Yourself (DRY) Styling** — If a task requires creating multiple forms or views that share structural wrappers, input styles, or button designs, preemptively extract them into shared primitives inside `components/ui/` or localized feature `components/`. Never copy-paste dense Tailwind utility chunks across files.

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
