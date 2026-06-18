---
description: hire-flow-next · Next.js 16 · React 19 · TS5 · Tailwind v4 · Shadcn UI · Motion · Lucid · Prisma 7/PG · Better Auth 1.6 · RHF 7 · Zod 4
---

# hire-flow-next — Agent Rules

> **Retrieval-first:** Read `package.json` (version source-of-truth), `tsconfig.json`, `prisma/schema.prisma`, and existing feature files before writing any code. Never invent APIs — verify against the installed version.

## Stack

| Layer              | Package                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Framework          | next@16.2.7 (App Router, Turbopack default)                                               |
| Styling            | tailwindcss@4 — PostCSS only, config via `globals.css @theme {}`, no `tailwind.config.js` |
| ORM                | prisma@7 + `@prisma/adapter-pg` + `pg`                                                    |
| Auth               | better-auth@1.6.15 + `@better-auth/prisma-adapter`                                        |
| Forms / Validation | react-hook-form@7 + `@hookform/resolvers` + zod@4                                         |
| Compiler           | babel-plugin-react-compiler (no manual `useMemo`/`useCallback`/`memo`)                    |
| Styling & Icons    | tailwindcss@4 + lucide-react (Config via `globals.css @theme {}`, no config files)        |
| Animation          | Motion (`motion`) — Best for micro-interactions & layout animations in React 19           |

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

## Feature-Based Structure (target — all new code must follow this)

```
app/
  (auth)/login/ register/ layout.tsx       ← public route group
  (dashboard)/layout.tsx                   ← auth shell (sidebar/nav)
    dashboard/ jobs/[jobId]/ candidates/[id]/ applications/[id]/
  api/auth/[...all]/route.ts               ← Better Auth catch-all only
features/<name>/
  types.ts        ← Zod schemas + z.infer<> types
  queries/        ← Prisma queries, server-side only
  actions/        ← 'use server' Server Actions
  components/     ← co-located UI ('use client' where needed)
  hooks/          ← client-only hooks
components/ui/    ← shared primitives
components/layout/
lib/auth.ts  auth-client.ts  prisma.ts  utils.ts
types/index.ts    ← cross-feature types
proxy.ts     ← session check + redirect
```

Pages are thin orchestrators. All logic lives in `features/`.

## Naming

| Thing             | Convention                 | Example                     |
| ----------------- | -------------------------- | --------------------------- |
| Files/folders     | kebab-case                 | `job-card.tsx`              |
| Components        | PascalCase named export    | `export function JobCard()` |
| Actions / queries | camelCase verb-noun        | `createJob`, `findJobById`  |
| Zod schemas       | PascalCase + `Schema`      | `CreateJobSchema`           |
| Inferred types    | PascalCase via `z.infer<>` | `type CreateJobInput`       |

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

## New Feature Checklist

1. `features/<name>/types.ts` — schemas + types
2. `features/<name>/queries/` — Prisma reads/writes
3. `features/<name>/actions/` — mutations
4. `features/<name>/components/` — UI
5. `app/(dashboard)/<name>/page.tsx` — thin page
6. Schema changes → `npx prisma migrate dev --name add-<name>`
7. Add new protected paths to `middleware.ts`

## New Dependency Protocol

1. Read `package.json` for exact version; check official docs before generating any code
2. Placement: UI lib → `components/ui/` · email → `lib/email.ts` · uploads → `lib/upload.ts` · auth provider → `lib/auth.ts`

## Commands

```bash
npm run dev|build|start|lint
npx prisma migrate dev --name <n> | generate | studio | db push
```

`postinstall` = `prisma generate` · `build` = `prisma migrate deploy && next build`

## Env Vars

`DATABASE_URL` · `BETTER_AUTH_SECRET` · `BETTER_AUTH_URL` · `NEXT_PUBLIC_APP_URL`

## Task Completion Gate

TypeScript passes · ESLint passes · no unused imports · no `any` · no dead code · no secrets in source · architecture rules followed

# My Copilot Agent

## Profile

You are an expert development assistant focused on writing clean, concise code.

## Output Constraints

To optimize token usage, you MUST follow these strict response rules:

- **Be Concise**: Provide the shortest possible answer that completely resolves the request.
- **No Yapping**: Omit conversational filler, pleasantries, and lengthy explanations.
- **Code Only**: Deliver only the requested code block unless explanation is explicitly requested.
- **Output Limit**: Limit all code outputs to a maximum of 30 lines at a time.
- **Truncate Tests**: Never write more than 3 sample test cases in a single response.
- **Use Placeholders**: Use `// ... existing code ...` or comments to skip repetitive structures.
- **Paginate**: If data or tests exceed limits, ask the user: "Would you like more?"
