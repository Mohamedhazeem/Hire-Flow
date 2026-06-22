# Hire Flow Next – Project Manifest

> **Purpose:** This file acts as the agent’s “long‑term memory”. It tracks what has been built, what is pending, and critical architectural decisions. The agent **must** update this file at the end of every session.

---

## 📅 Last Updated
`2026-06-22T12:53:00Z`

---

## 📊 Overview
- **Current Phase:** Phase 0
- **Current Step:** Step 0.6 – TanStack Query Provider & Zustand Stores
- **Next Step:** Step 0.7 – Project Manifest (this file)
- **Blockers:** None

---

## ✅ Completed Steps
*(Agent: mark `[x]` for completed steps, `[ ]` for pending. Keep this section up to date.)*

### Phase 0: Foundation
- [x] Step 0.0 – Project Initialisation & Dependencies
- [x] Step 0.1 – Prisma Schema
- [x] Step 0.2 – Middleware & Route Guards
- [x] Step 0.3 – Shared UI Primitives
- [x] Step 0.4 – Mock File Upload Provider
- [x] Step 0.5 – Database Seed Script
- [x] Step 0.6 – TanStack Query Provider & Zustand Stores
- [ ] Step 0.7 – Project Manifest (this file)

### Phase 1: Admin
- [ ] Step 1.1 – Admin API (Queries & Ban Action)
- [ ] Step 1.2 – Admin UI (Users & Recruiters)
- [ ] Step 1.3 – Admin Team Management
- [ ] Step 1.4 – Admin Job Oversight & Analytics
- [ ] Step 1.5 – Admin Messaging Entry Point

### Phase 2: Recruiter
- [ ] Step 2.1 – Company Profile CRUD
- [ ] Step 2.2 – Job Posts CRUD
- [ ] Step 2.3 – Applicants View & Status Updates
- [ ] Step 2.4 – Recruiter Analytics & Filters

### Phase 3: User
- [ ] Step 3.1 – User Profile
- [ ] Step 3.2 – Resumes & In-App Builder
- [ ] Step 3.3 – Job Application Flow
- [ ] Step 3.4 – User Activity Panel

### Phase 4: Public Job Routes & Home Page
- [ ] Step 4.1 – Public Job Listings
- [ ] Step 4.2 – Public Job Details & View Tracking
- [ ] Step 4.3 – Home Page & Global Navbar

### Phase 5: Messaging & Notifications
- [ ] Step 5.1 – Messaging & Real-Time Setup
- [ ] Step 5.2 – Real-Time Subscriptions & Shared Chat UI
- [ ] Step 5.3 – Wiring Chat into Role Pages
- [ ] Step 5.4 – Real-Time Notifications System

---

## 📁 Created File Paths (Grouped by Phase)
*(Agent: append new files to the appropriate phase section.)*

### Phase 0
- `prisma/schema.prisma` (updated)
- `middleware.ts`
- `app/(admin)/layout.tsx`
- `app/(recruiter)/layout.tsx`
- `app/(user)/layout.tsx`
- `lib/api-response.ts`
- `lib/pagination.ts`
- `components/ui/data-table.tsx`
- `components/ui/status-badge.tsx`
- `components/layout/page-header.tsx`
- `lib/upload.ts`
- `app/api/upload/route.ts`
- `prisma/seed.ts`
- `lib/query-client.ts`
- `stores/ui-store.ts`
- `stores/chat-store.ts`
- `lib/api-client.ts`
- `MANIFEST.md` (this file)

### Phase 1
*(agent to fill)*

### Phase 2
*(agent to fill)*

### Phase 3
*(agent to fill)*

### Phase 4
*(agent to fill)*

### Phase 5
*(agent to fill)*

---

## 🔗 Pending Dependencies
*(Agent: list anything that must be built before the next step can start.)*

- None – ready to start Phase 1.

---

## 🧠 Active Global Context Snapshot
*(Agent: keep a concise summary of the key architectural rules, so you don't have to re‑read the entire `AGENTS.md` every time.)*

- **Mutations/Fetching:** REST route handlers for complex mutations; Server Actions only for plain forms. TanStack Query for all client‑side data.
- **State Management:** Zustand strictly for UI client‑state (sidebars, modals), never for API data.
- **Real‑time:** Pusher with `private-thread-[id]` and `private-user-[id]` channels.
- **Route Guards:** Role‑based middleware and layout‑level protection.
- **Styling:** Tailwind v4 + Shadcn, using theme variables (`bg-primary`, etc.), no hardcoded hex.
- **Validation:** Always run `npx prisma validate` and `npm run build` after changes.

---

## 🐛 Known Issues / TODOs
*(Agent: record temporary workarounds, known bugs, or future refactoring tasks.)*

- [ ] TODO: Replace mock upload (`/api/upload`) with S3/Vercel Blob in production.
- [ ] TODO: Add comprehensive tests once core features are stable.