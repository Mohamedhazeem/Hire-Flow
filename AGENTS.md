---
description: hire-flow-next · Next.js 16 · React 19 · TS5 · Tailwind v4 · Shadcn UI · Motion · Lucid · Prisma 7/PG · Better Auth 1.6 · RHF 7 · Zod 4
---

# MANDATORY STARTUP PROCEDURE (READ FIRST)

**Before you generate any code, respond to this user, or execute any step, you MUST:**

1. Read the entire contents of `MANIFEST.md` located in the project root.
2. Based on the manifest, report back to the user in this exact format:
   - **Current Phase:** (e.g., Phase 1)
   - **Last Completed Step:** (e.g., Step 1.1)
   - **Next Pending Step:** (e.g., Step 1.2)
   - **Blockers / Pending Dependencies:** (list any)
3. **Do not proceed** to write code or execute a new step until the user confirms the next step to execute.
4. If the user asks to execute a step, always cross-reference the step number against `MANIFEST.md` to ensure it hasn't already been completed.

# hire-flow-next Architecture Rules
You are an expert Next.js 16 (App Router) and Prisma developer. Strictly adhere to these rules:

1. **Mutations & Fetching:**
   - **REST route handlers** (`app/api/...`) are the DEFAULT for all data mutations and fetching (e.g., apply, send message, ban, analytics, delete actions).
   - **Server Actions** (`'use server'`) are strictly reserved for PLAIN FORM SUBMISSIONS ONLY (e.g., create job, update profile, edit company) to save network round-trips.
   - Use **TanStack Query** (`@tanstack/react-query`) for all client-side data fetching, caching, and background updates.
   - Use **Zustand** exclusively for global UI client-state (sidebars, modals, collapse toggles) – never store API data in Zustand.

2. **Messaging & Notifications:** - Event-Driven WebSockets via Hosted Provider (Pusher) for real-time messaging and notifications. 
   - NO interval polling.
   - Use private-thread-[threadId] channels for chat (one‑to‑one DMs) and private-user-[userId] channels for global notifications. This ensures Better Auth can easily authorise subscriptions.

3. **Route Groups:** - Use `(admin)`, `(recruiter)`, `(user)`, `(auth)`, and public routes. 
   - Each protected group must have a layout role guard.

4. **Auth:** - Assume Better Auth is configured at `lib/auth.ts`. 
   - Use `auth.api.getSession()` for all server-side auth checks.

5. **Validation & Safety:**
After any modification to prisma/schema.prisma, you must run npx prisma validate and npx prisma generate.
After any step that creates or modifies TypeScript files, you must run npm run build or tsc --noEmit to confirm zero type errors.

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

Files/Folders: kebab-case (e.g., job-card.tsx)

Components: PascalCase named exports (e.g., export function JobCard())

Actions/Queries: camelCase verb-noun (e.g., createJob, findJobById)

Zod Schemas: PascalCase + Schema (e.g., CreateJobSchema)

Inferred Types: PascalCase via z.infer (e.g., type CreateJobInput)

## Key Patterns (rules — no code examples needed)

- **Server Action flow:** `'use server'` → `Schema.safeParse()` → DB write → `revalidatePath()` → `redirect()`
- **Dynamic page:** `params: Promise<{ id: string }>` — always destructure after `await params`
- **Form:** `useForm<T>({ resolver: zodResolver(Schema) })` using `@hookform/resolvers/zod`
- **Queries:** in `features/<name>/queries/` only — never inside components or actions files
- **Route handlers:** only for Better Auth catch-all, webhooks, or third-party REST consumers
- **Auth middleware:** `auth.api.getSession({ headers: request.headers })` — redirect to `/login` if no session
- **Auth catch-all:** `export const { GET, POST } = toNextJsHandler(auth)` in `app/api/auth/[...all]/route.ts`
- **UI Component Extraction:** Always extract inputs with validation error states using `React.forwardRef` (compatible with React Hook Form) so they are highly reusable.
- **Layout Orchestration:** Isolate shared page wrappers, animated backgrounds, and page shells into localized layout components (`auth-layout.tsx`) or standard Next.js layouts, keeping feature pages as thin orchestrators.

## Theme & Icon Rules

- **Tokens Only:** Never use arbitrary Tailwind values (no `[...]`). Use `@theme` variables: `text-text-body`, `bg-bg-surface`, `p-spacing-4`, `rounded-radius-md`.
- **Lucide Icons:** Destructure from `'lucide-react'`. Use Tailwind v4 `size-4` or `size-5` with `strokeWidth={2}` (or `1.5`). Match icon color to text context (`text-text-muted`).
- **Layout:** Enforce layout constraints via `max-w-(--container-width)` or strict `p-spacing-20` equivalents.

## Shadcn UI Harmonization

- **Installation:** Install components using `npx shadcn@latest add <component>`. All primitives must reside strictly in `components/ui/`.
- **Theme Bridging:** Bridge Shadcn to the custom design system by mapping its semantic tokens to your custom theme variables within the `globals.css` `@theme inline` block instead of maintaining raw separate colors.

## Animation Rules

- **Tailwind Native First:** Use built-in utilities (`animate-fade-in`, `transition-all`, `duration-200`) for simple hover states, transitions, status pickers, and entry fades.
- **Framer Motion for Orchestration:** Use `motion/react` and `motion/react-client` (`motion.div`) _only_ for complex multi-step orchestration, layout transitions (`layoutId`), dynamic presence (`AnimatePresence`), or interactive sidebars.
- **Performance:** Keep animation durations under `300ms` for core UI. Prefer `transform` and `opacity` mutations over animating layout properties like `height`, `width`, or `margin`.

## Forbidden

- `pages/` directory · inline `new PrismaClient()` · `useEffect` for data fetching
- `getServerSideProps` / `getStaticProps` · synchronous `params` access
- `$queryRawUnsafe` / `$executeRawUnsafe` · `deleteMany()` / `updateMany()` without explicit request
- `fetch` in Client Components (use Server Actions or Route Handlers)
- Per-component CSS files · `any` type · `as` casts except `unknown` narrowing

## New Dependency Protocol

1. Read `package.json` for exact version; check official docs before generating any code
2. Placement: UI lib → `components/ui/` · email → `lib/email.ts` · uploads → `lib/upload.ts` · auth provider → `lib/auth.ts`

## Commands

```bash
npm run dev|build|start|lint
npx prisma migrate dev --name <n> | generate | studio | db push
```

`postinstall` = `prisma generate` · `build` = `prisma migrate deploy && next build`

## Task Completion Gate

TypeScript passes · ESLint passes · no unused imports · no `any` · no dead code · no secrets in source · architecture rules followed

## Output Constraints
- **Be concise:** Provide the shortest possible answer that fully resolves the request.
- **Skip filler:** Omit conversational pleasantries and lengthy explanations unless explicitly asked.
- **Full files only:** Always output the complete file content for newly created files. For updates, output the entire updated file.
- **Use comments for repeats:** If a file is large and you are only changing one function, use `// ... existing code ...` to skip repetitive boilerplate, but ensure the final code block is complete enough to copy‑paste without errors.
- **Ask for confirmation:** If a file exceeds 150 lines, ask: *"This file is large. Do you want the full version or only the changed sections?"*
