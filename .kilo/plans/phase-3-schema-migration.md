# Phase 3 — Steps 3.0a & 3.0b: Infrastructure Audit & Schema Migration

## Goal

Complete the two prerequisite steps for Phase 3 (User) before building profile, resumes, applications, and messaging features.

---

## Step 3.0a — Infrastructure Audit (Verification Only)

**No code changes.** Confirm the following are already wired:

- [ ] `app/(roles)/user/layout.tsx` — calls `checkRole(["user"])`, renders `<UserLayoutClient>`
- [ ] `app/(roles)/user/user-layout-client.tsx` — wraps `<RoleLayoutClient messagesBasePath="/user/messages" sidebar={<UserSidebar />}>`
- [ ] `app/features/user/components/user-sidebar.tsx` — renders `<Sidebar>` with links: Dashboard, Profile, Applications, Messages
- [ ] `app/(roles)/user/messages/page.tsx` — exists and routes to `<UserMessagesPage>`
- [ ] `app/(roles)/user/notifications/page.tsx` — exists and routes to `<NotificationsPage messagesBasePath="/user/messages">`
- [ ] `app/features/user/hooks/messages/use-user-threads.ts` — TanStack Query hook exists
- [ ] `app/features/user/hooks/messages/use-user-messages.ts` — TanStack Query hook exists
- [ ] `app/features/user/components/user-messages-page.tsx` — uses shared `<MessagesPageLayout>`
- [ ] `app/features/user/components/user-thread-view.tsx` — full chat view with Pusher
- [ ] NotificationDropdown in `role-layout-client.tsx` — includes `messagesBasePath="/user/messages"`
- [ ] `lib/notifications.ts` — shared utility (`createNotification`, `createNotificationsBulk`, `triggerForCompany`)
- [ ] Auth guard `requireRole(['user'])` — defined in `features/shared/api/require-role.ts`

**Edge cases verified:**
- User landing on `/user` currently shows a placeholder (`CANDIDATEDASHBOARD`) — this is intentional per 3.0a spec ("no dashboard") since Phase 4 Step 4.3 will redirect users to `/jobs`. No change needed.
- Sidebar links have no unread badge wiring — the `SidebarLink` type supports `badge?: number` but neither recruiter nor user sidebars populate it. This is consistent. Adding badges is a future enhancement.
- Filtered queries with no results vs. no data at all: the empty states in `<DataTable>` and `<NotificationsPage>` handle this.

---

## Step 3.0b — Schema Migration (Code Changes)

### File: `prisma/schema.prisma`

**Change 1 — Add `deletedAt` to `Resume` model:**
```prisma
model Resume {
  // ... existing fields ...
  deletedAt   DateTime?  // soft‑delete timestamp; resumes kept 60 days for snapshot access
}
```

**Change 2 — Add snapshot fields to `Application` model:**
```prisma
model Application {
  // ... existing fields ...
  resumeSnapshotUrl         String?  // fileId for uploaded resumes (snapshot at apply time)
  resumeSnapshotBuilderData Json?    // JSON for in‑app builder resumes (snapshot at apply time)
}
```

### Rationale per field:
| Field | Purpose |
|---|---|
| `resume.deletedAt` | Soft-delete support: user removes resume from their list but recruiters still see it via application snapshots. Cron job purges after 60 days. |
| `application.resumeSnapshotUrl` | Freeze the resume file URL at apply time. Survives resume deletion. |
| `application.resumeSnapshotBuilderData` | Freeze the builder JSON at apply time. Survives resume deletion. |

### No new models, no new enums needed:
- `NotificationType` already has `application_status` and `new_message` — sufficient for Phase 3 triggers.
- No `withdrawn` status in the schema yet — will be added in Step 3.5 when withdraw action is built. Not part of 3.0b.

### Workflow:
1. Add fields to `schema.prisma`
2. Run `npx prisma format` — ensures valid formatting
3. Run `npx prisma validate` — catches any schema errors
4. Run `npx prisma generate` — regenerates Prisma client (works without live DB)
5. Run `npx prisma db push` — applies schema changes to local DB (does not create migration files; acceptable since migrations are blocked)

### Migration command sequence:
```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma db push
```

---

## After Completion

Update `MANIFEST.md`:
- Mark Steps 3.0a and 3.0b as `[x]`
- Update `Next Step` to `Step 3.1 — User Profile`
- List new/modified file paths

---

## Files Changed

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `deletedAt` to `Resume`, add `resumeSnapshotUrl`+`resumeSnapshotBuilderData` to `Application` |
| `MANIFEST.md` | Update status for Steps 3.0a/3.0b |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Schema changes may conflict with future migrations | Using `db push` (no migration file); client generation succeeds without live DB |
| Existing applications have no snapshot data | Step 3.5 spec includes a one-time backfill script; not needed here |
| `deletedAt` filter must be applied everywhere | Add `where: { deletedAt: null }` to all user-facing resume queries in Step 3.2 |
| File download route only allows admin/recruiter | Step 3.2 must extend `app/api/files/download/route.ts` to allow `userId === resume.userId` (self-download) |

---

## Verification Gate

1. `npx prisma validate` exits with **code 0**
2. `npx prisma generate` produces no errors
3. `npx prisma db push` succeeds
4. `npm run build` passes with no type errors
5. `MANIFEST.md` correctly reflects completion of Steps 3.0a/3.0b
