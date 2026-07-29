# Step 2.10 — Notifications & Activity Feed

## Goal

Extract shared notification infrastructure, add recruiter notification triggers (new application, status changes by teammates, new messages), deliver them via dropdown + standalone activity page, and wire sidebar badge counts. Reuse existing `Notification` model; do **not** add new Prisma enum values.

## Design Decisions

| Decision                               | Choice                                                                         | Rationale                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Notification type for new applications | Use existing `application_status` with `previousStatus: null` as discriminator | No Prisma enum value `new_application` exists; schema changes are blocked (unreachable DB server). |
| Sidebar badge source                   | `useUnreadCount(userId)` (TanStack Query) called inside `RecruiterSidebar`     | Already reactive (30s polling + Pusher cache updates). No separate Zustand store needed.           |
| Sidebar links array                    | Move inside component function; derive badge from hook                         | Static `const` array can't inject dynamic badge.                                                   |
| Role-aware notification links          | `getNotificationHref` accepts role param; maps type to correct route           | Prevents broken `/admin/*` links for recruiters.                                                   |
| User notifications page                | Create minimal placeholder                                                     | Sidebar link exists → would 404 without it.                                                        |
| Bulk notifications to company team     | Create `createNotificationsBulk` + `triggerForCompany` helpers                 | Multiple recruiter route handlers (bulk status, revert) need batch notification + Pusher.          |

## Files to Create (6)

### 1. `lib/notifications.ts` — Shared notification utility

```
- createNotification(userId, type, data): creates DB row + fires Pusher event on private-user-{userId}
- createNotificationsBulk(items: {userId, type, data}[]): createMany + iterate pusher.trigger
- triggerForCompany(companyId, type, data, { excludeUserId? }): queries CompanyTeamMember, calls createNotificationsBulk for all members
- pushRealtimeNotification(userId, notification): single Pusher trigger helper
```

### 2. `app/features/notifications/components/notifications-page.tsx` — Standalone activity page

- Reuses `useNotifications(userId)` (infinite scroll with `fetchNextPage`)
- Reuses `useUnreadCount(userId)` and `useMarkAsRead()`
- Reuses `useRealtimeNotifications(userId)` for live updates
- Props: `messagesBasePath` (role-aware)
- Header: "Notifications" title + "Mark all read" button
- List: same per-item rendering as dropdown (icon, preview, time, read dot)
- Empty state: matches dropdown pattern (BellIcon + "No notifications yet")
- Loading state: skeleton rows
- Mobile-first: single column, responsive

### 3. `app/(roles)/recruiter/notifications/page.tsx`

```
import NotificationsPage from "@/app/features/notifications/components/notifications-page"
export default function Page() {
  return <NotificationsPage messagesBasePath="/recruiter/messages" />
}
```

### 4. `app/(roles)/user/notifications/page.tsx`

Minimal placeholder (same structure, `/user/messages`). Prevents 404 on existing sidebar link. Renders real `NotificationsPage` — works since hooks and API are user-agnostic.

### 5. `stores/notification-store.ts` (skipped — unnecessary)

Zustand store considered but **removed** per edge case analysis. `useUnreadCount` (TanStack Query) already provides reactive polling + Pusher cache updates.

## Files to Modify (10)

### 6. `components/layout/role-layout-client.tsx`

- Add `messagesBasePath?: string` to `RoleLayoutClientProps` (default `/admin/messages` for backward compat)
- Pass to both `<NotificationDropdown>` instances

### 7. `app/(roles)/recruiter/recruiter-layout-client.tsx`

- Pass `messagesBasePath="/recruiter/messages"` to `<RoleLayoutClient>`

### 8. `app/(roles)/user/user-layout-client.tsx`

- Pass `messagesBasePath="/user/messages"` to `<RoleLayoutClient>`

### 9. `app/(roles)/admin/admin-layout-client.tsx`

- Pass `messagesBasePath="/admin/messages"` explicitly (was implicit default)

### 10. `app/features/notifications/components/notification-dropdown.tsx`

- **`getNotificationHref(n, messagesBasePath)` — make role-aware:**
  - `new_message`: `${messagesBasePath}?thread=${data.threadId}` (already correct)
  - `application_status`: derive role from `messagesBasePath`
    - if `/admin/*` → `/admin/jobs`
    - if `/recruiter/*` → `/recruiter/applicants/${data.applicationId}`
    - if `/user/*` → `/user/applications`
  - Fallback: base path root
- Add `useSearchParams` to `NotificationDropdown` → pass role context to the href function
- **Add `RecruiterApplicantLink`** to `getNotificationPreview` for recruiter `application_status` type showing applicant name

### 11. `app/features/notifications/hooks/use-notifications.ts`

- In `useMarkAsRead` `onSuccess`: clear `queryClient` for `["notifications"]` keys (already done)
- No Zustand store integration (removed)

### 12. `app/features/recruiter/components/recruiter-sidebar.tsx`

- Move `recruiterLinks` inside component function
- Add `useUnreadCount(session?.user?.id ?? "")` call
- Derive badge: `const links = baseLinks.map(l => l.href === "/recruiter/notifications" ? { ...l, badge: unreadCount } : l)`
- Add `/recruiter/notifications` link to sidebar (BellIcon, "Notifications" label)

### 13. `app/api/recruiter/applications/[applicationId]/status/route.ts`

- Replace inline `prisma.notification.create` with `createNotification(application.userId, "application_status", { ...data })`
- Replace inline `pusher.trigger` — `createNotification` handles it internally

### 14. `app/api/recruiter/applications/bulk/status/route.ts`

- Replace inline `prisma.notification.createMany` with `createNotificationsBulk(applications.map(...))`
- The bulk variant must also fire Pusher events (currently lacks them)

### 15. `app/api/recruiter/applications/[applicationId]/revert/route.ts`

- **Add** notification creation via `createNotification(application.userId, "application_status", { ... })`
- Currently creates NO notification — add status reverted notification

### 16. `app/api/recruiter/messages/[threadId]/route.ts`

- Replace inline notification + Pusher code with `createNotification(...)`

### 17. `app/api/admin/messages/[threadId]/route.ts`

- Replace inline notification + Pusher code with `createNotification(...)`

## Notification Triggers

| Trigger                     | Location                              | Type                 | Recipient                                        | Data                                                                                            |
| --------------------------- | ------------------------------------- | -------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| New application submitted   | (future: `POST /api/jobs/[id]/apply`) | `application_status` | All company recruiters (via `triggerForCompany`) | `{ applicationId, jobId, jobTitle, applicantName, previousStatus: null, newStatus: "applied" }` |
| Status changed by recruiter | `status/route.ts`                     | `application_status` | Applicant                                        | `{ applicationId, jobId, previousStatus, newStatus, updatedBy }`                                |
| Status changed via bulk     | `bulk/status/route.ts`                | `application_status` | Each applicant                                   | `{ applicationId, jobId, previousStatus, newStatus, pendingEmail }`                             |
| Status reverted             | `revert/route.ts` (NEW)               | `application_status` | Applicant                                        | `{ applicationId, jobId, previousStatus, newStatus: revertToStatus, note: "Reverted" }`         |
| New message received        | `messages/[threadId]/route.ts`        | `new_message`        | Thread participant                               | `{ threadId, senderId, senderName, preview }`                                                   |

## Edge Cases Handled

1. **Role-aware notification links** — `getNotificationHref` uses role derived from `messagesBasePath` to route to correct pages
2. **Multiple company recruiters** — `triggerForCompany` queries `CompanyTeamMember`, creates via `createMany`, fires Pusher per user
3. **No `new_application` enum value** — reuses `application_status` with `previousStatus: null` as discriminator. No migration needed.
4. **Sidebar links are reactive** — moved inside component; badge reads from `useUnreadCount` hook
5. **All 3 layouts pass `messagesBasePath`** — admin, recruiter, user are consistent. Backward compat via default param.
6. **Bulk + revert routes lack Pusher** — added via shared utility. Bulk uses `createNotificationsBulk` with per-user push. Revert creates notification for applicant.
7. **User Notifications page exists** — prevents 404 on existing sidebar link
8. **No Zustand store** — TanStack Query handles unread count reactivity, avoiding redundant state layer

## Validation

```bash
npx tsc --noEmit       # TypeScript strict check
npm run lint           # ESLint (no unused imports, no any)
npm run dev -- --turbo # Dev server smoke test
```

Manual checklist:

- [ ] Send message as recruiter → notification appears in dropdown + page
- [ ] Change applicant status → notification appears for applicant
- [ ] Bulk change status → notifications for all applicants
- [ ] Revert status → notification created
- [ ] Notification bell shows correct unread count
- [ ] Sidebar badge shows unread count (consistent with bell)
- [ ] Click notification → navigates to correct role-specific page
- [ ] User sidebar `/user/notifications` link → loads page (not 404)
- [ ] Polling fallback works when Pusher disconnected
- [ ] Empty state renders correctly
- [ ] Infinite scroll loads more notifications
