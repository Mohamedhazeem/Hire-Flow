---
description: hire-flow-next · Next.js 16 · React 19 · TS5 · Tailwind v4 · Shadcn UI · Motion · Lucid · Prisma 7/PG · Better Auth 1.6 · RHF 7 · Zod 4 · recharts · tanstack · zustand 
---

# STATE & CACHE RULES (short)
- **Startup:** Read `MANIFEST.md` once; cache in‑memory. Report: Phase, Last Step, Next Step, Blockers.
- **Runtime:** Never re‑read MANIFEST; use cache for step lookups.
- **Updates:** Update cache + write to disk after **every** completed step; bump `Last Updated`.
- **Resync:** Re‑read only if user says they edited it manually.

# hire-flow-next — Agent Rules

> **Retrieval-first:** Read `package.json` (version source-of-truth), `tsconfig.json`, `prisma/schema.prisma`, and existing feature files before writing any code. Never invent APIs — verify against the installed version.

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