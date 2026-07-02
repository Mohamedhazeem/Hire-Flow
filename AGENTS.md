---
description: hire-flow-next · Next.js 16 · React 19 · TS5 · Tailwind v4 · Shadcn UI · Motion · Lucid · Prisma 7/PG · Better Auth 1.6 · RHF 7 · Zod 4 · recharts · tanstack · zustand
---

# Agent Rules (applied always)

## Spec Migration Protocol (First‑Run Only)

> **If** `docs/specs/` does **not** exist, and root `hire_flow_prompts.md` and `hire_flow_testing.md` **do** exist, perform this **one‑time migration** before any planning:

1. **Create folders:** `docs/specs/`, `docs/architecture/`, `docs/implementation/`, `docs/testing/`.
2. **Split `hire_flow_prompts.md`**:
   - Extract the **Global Context** (stack, rules, structure) → `docs/architecture/technical-design.md`.
   - Extract **User Stories & Acceptance Criteria** from each Phase → `docs/specs/hire-flow-requirements.md`.
   - Extract the **Actionable Tasks** from each Step → `docs/implementation/implementation-tasks.md` (assign stable Task IDs like `TASK-2.3.1`).
3. **Move `hire_flow_testing.md`** verbatim → `docs/testing/testing-strategy.md`.
4. **Deprecate root files**: Add a clear `⚠️ ARCHIVED` banner at the top of `hire_flow_prompts.md` and `hire_flow_testing.md`, pointing to the new `/docs` folders.
5. **Update `MANIFEST.md`** to reflect the new spec‑driven structure and mark the migration as complete.
6. **Cache the new specs** in memory immediately. **Never read the old root files again** unless the user explicitly says they edited them manually.

---

## Retrieval‑first (Always)

- Read `package.json`, `tsconfig.json`, `prisma/schema.prisma`, and **relevant spec files** before writing code.
- For design context: read `docs/architecture/technical-design.md` (cached).
- For feature scope: read `docs/specs/hire-flow-requirements.md` (cached).
- For task breakdown: read `docs/implementation/implementation-tasks.md` (cached).
- For QA reference (do not use for planning): read `docs/testing/testing-strategy.md` if the user asks about tests.
- Never invent APIs — verify against installed dependencies.

## Shared Assets

- Reuse the following; do not rebuild them:  
  _(table of assets goes here, unchanged from your original)_

## Role Guard Requirement

Whenever you create a new protected Server Action or API Route, you **MUST** use `requireRole([...])` from `features/shared/api/require-role.ts`. All protected actions/routes must call this guard first.

## State & Cache Rules (Updated for Spec‑Driven)

- **Startup:**  
  Read `MANIFEST.md`, `docs/specs/hire-flow-requirements.md`, `docs/architecture/technical-design.md`, `docs/implementation/implementation-tasks.md` once; cache in‑memory.  
  **Report:** Current Phase, Last Completed Task ID, Next Task ID, Blockers.
- **Runtime:**  
  Never re‑read the spec files; use the cache for all step lookups and task references.
- **Resync:**  
  Re‑read only if the user explicitly says they edited the spec files manually, or if you detect a mismatch between `MANIFEST.md` and the cached tasks.

## Graphify

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross‑file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts.
- Dirty `graphify-out/` files are expected after hooks or incremental updates; do not skip graphify because of them (unless the task is about stale graph output or the user explicitly says not to use it).
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST‑only, no API cost).

## Phase 2 & 3 (Recruiter & User)

**Before implementing any feature** from these phases:

- Read the relevant **Feature Spec** from `docs/specs/hire-flow-requirements.md` (cached) to understand the **Acceptance Criteria**.
- Read the **Architecture Design** from `docs/architecture/technical-design.md` (cached) for state machines, data flow, and component reuse rules.
- Cross‑reference the **Task IDs** (e.g., `TASK-2.3.1`) listed in `docs/implementation/implementation-tasks.md` to ensure you are fulfilling the exact scope of the task.

Most components and patterns are shared with `admin`. If a component already exists in `app/features/admin/`, reuse it (or generalise it to `components/shared/`) – do not rewrite.

---

## Stack (unchanged – keep as reference)

Framework: Next.js (App Router, Turbopack)  
Styling: Tailwind v4 (`@theme` in `globals.css`, no config)  
DB: Prisma + PostgreSQL  
Auth: Better Auth + Prisma Adapter  
Data fetching: TanStack Query (server‑state & caching)  
Client state: Zustand (UI store only – modals, sidebars)  
Forms/Validation: RHF + Zod  
Compiler: React Compiler (Automatic memoization)  
Icons: react-icons  
Animations: motion

---

## Absolute Rules (unchanged)

- **App Router only** — `app/` dir; never `pages/`
- **`params`/`searchParams` are Promises** in Next.js 16 — always `await` them
- **Server Components by default** — add `'use client'` only for hooks, events, or browser APIs
- **Server Actions = `'use server'`** — never call DB directly from Client Components
- **TypeScript strict** — no `any`; use `unknown` + Zod for external data; `import type` for type‑only imports
- **Zod validates all input** before every DB write
- **Prisma = singleton** — import from `lib/prisma.ts` only; never `new PrismaClient()` inline
- **npm only** — never yarn/pnpm/bun
- **No secrets in source** — values in `.env.local`, names only in `.env.example`
- **Minimal scope** — touch only files required by the task; no renames, refactors, or dep upgrades unless asked
- **Don't Repeat Yourself (DRY) Styling** — if a task requires creating multiple forms or views that share structural wrappers, input styles, or button designs, preemptively extract them into shared primitives inside `components/ui/shared` or `components/ui/layout` or localized feature `components/`. Never copy‑paste dense Tailwind utility chunks across files.

---

## Project Structure Rules (unchanged – include your exact folder/naming rules)

_(Keep the full “Core Routing”, “Feature‑Based Logic”, “Shared Layers”, “Naming”, “Key Patterns” sections exactly as they were in your original – they are already excellent.)_

---

## Theme & UI (unchanged)

_(Keep all responsive design, component reuse, and admin layout rules.)_

---

## Context Pack — Read Before Writing Any Code (unchanged)

_(Keep the full list of existing components, utilities, and cross‑feature reuse notes – these are critical for the agent.)_

---

## Forbidden (unchanged)

_(Keep all forbidden patterns.)_

---

## Dependencies Protocol (unchanged)

_(Keep the dependency checking rules.)_

---

## Commands (unchanged)

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
