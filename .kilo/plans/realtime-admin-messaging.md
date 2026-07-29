# Realtime Admin Messaging & Notification System

## Goal

Upgrade admin messaging to realtime (Pusher WebSockets) and build the in-app notification system. The Notification Prisma model already exists. This is admin-only for now; recruiter messaging (Step 2.5) reuses this later.

## Provider: Pusher

Reason: Specified in `HIRE_FLOW_PROMPTS.md` as "Event-Driven WebSockets via Hosted Provider (Pusher)". Private channels with server-side auth via `/api/pusher/auth`.

---

## Files to Create (8)

### 1. `lib/pusher.ts` — Server-side singleton

```typescript
import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

### 2. `lib/pusher-client.ts` — Client-side lazy singleton

```typescript
import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherClient) {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
      auth: { headers: {} }, // cookies sent automatically
    });
  }
  return pusherClient;
}
```

### 3. `app/api/pusher/auth/route.ts` — Private channel auth

- POST handler: read `channel_name` and `socket_id` from form data
- Call `auth.api.getSession({ headers: request.headers })`
- If no session → 401
- Return `pusher.authorizeChannel(socketId, channelName, { user_id: session.user.id })`

### 4. `app/features/notifications/schema/notification.schema.ts`

- `NotificationTypeSchema`: `z.enum(["application_status", "new_message", "profile_viewed", "ban_status"])`
- `MarkNotificationsReadSchema`: `z.object({ ids: z.array(z.string()).min(1) })`

### 5. `app/features/notifications/queries/notification-queries.ts`

- `listNotifications(userId: string, cursor?: string, take = 20)` — cursor-based pagination, `createdAt desc`, returns `{ items, nextCursor, hasMore }`
- `getUnreadCount(userId: string)` — `prisma.notification.count({ where: { userId, read: false } })`

### 6. `app/features/notifications/hooks/use-notifications.ts`

- `useNotifications()` — `useInfiniteQuery(["notifications", userId])`, cursor-based
- `useUnreadCount()` — `useQuery(["notifications", "unread", userId])` with `refetchInterval: 30_000`
- `useMarkAsRead()` — `useMutation` → PATCH `/api/notifications` with `{ ids }`, invalidates both queries
- `useRealtimeNotifications()` — subscribes to `private-user-{userId}` channel, listens for `"new-notification"` event, appends to infinite query cache and increments unread count. Returns cleanup function.

### 7. `app/features/notifications/components/notification-dropdown.tsx`

- Bell icon button (Lucide `BellIcon` + `BellDotIcon` when unread)
- Uses `useUnreadCount()` for badge, `useNotifications()` for list
- Uses `useRealtimeNotifications()` to subscribe to realtime updates
- shadcn Popover: `Popover`, `PopoverTrigger`, `PopoverContent`
- Content: header with "Notifications" + "Mark all read" button, scrollable list of notification items
- Each item: icon (based on `type`), content preview from `data.preview`, relative timestamp, unread dot
- Click on message notification → `router.push("/admin/messages?thread={threadId}")`
- Empty state when no notifications
- Props (optional later): `messagesBasePath` for cross-role reuse

### 8. `app/api/notifications/route.ts`

- `GET` — Authenticate user via `auth.api.getSession({ headers })`, parse `cursor` + `take` from search params, call `listNotifications` + `getUnreadCount`, return `{ notifications: items, nextCursor, hasMore, unreadCount }`
- `PATCH` — Authenticate user, parse body with `MarkNotificationsReadSchema`, call `prisma.notification.updateMany({ where: { id: { in: ids }, userId: session.user.id }, data: { read: true } })`, return `ok({ updated: count })`

---

## Files to Modify (4)

### 9. `app/api/admin/messages/[threadId]/route.ts` — Add Pusher + Notification on POST

In the `handlePOST` function, after `prisma.message.create()` succeeds and before `return ok(message, 201)`:

```typescript
// 1. Trigger realtime new-message event to thread channel
await pusher.trigger(`private-thread-${threadId}`, "new-message", {
  message: { ...message, createdAt: message.createdAt.toISOString() },
  senderId: adminUser.id,
});

// 2. Create in-app notification for receiver
const notification = await prisma.notification.create({
  data: {
    userId: otherUserId,
    type: "new_message",
    data: {
      threadId,
      senderId: adminUser.id,
      senderName: adminUser.name,
      preview: message.content.slice(0, 100),
      fileUrl: message.fileUrl,
      fileType: message.fileType,
    },
  },
});

// 3. Trigger realtime notification to receiver
await pusher.trigger(`private-user-${otherUserId}`, "new-notification", {
  notification,
});
```

- Import `pusher` from `@/lib/pusher`
- The existing `requireRole(["admin", "super_admin"])` guards access — no changes needed

### 10. `app/features/admin/hooks/messages/use-admin-messages.ts` — Add refetchInterval

In `useAdminMessages()`, add to the `useInfiniteQuery` config:

```typescript
refetchInterval: 60_000,
```

This is a fallback for when Pusher WebSocket drops.

### 11. `app/features/admin/components/thread-view.tsx` — Subscribe to realtime messages

Add `useEffect` in the component (when `threadId` changes):

```typescript
import { getPusherClient } from "@/lib/pusher-client";
import { useQueryClient } from "@tanstack/react-query";

// Inside ThreadView component:
const queryClient = useQueryClient();

useEffect(() => {
  const channel = getPusherClient().subscribe(`private-thread-${threadId}`);

  channel.bind("new-message", (data: { message: MessageItem; senderId: string }) => {
    if (data.senderId !== adminId) {
      // Append to the last page of the infinite query cache
      queryClient.setQueryData(["admin", "messages", threadId], (old: any) => {
        if (!old?.pages) return old;
        const newPages = [...old.pages];
        const lastPage = { ...newPages[newPages.length - 1] };
        lastPage.data = {
          ...lastPage.data,
          messages: [...lastPage.data.messages, data.message],
        };
        newPages[newPages.length - 1] = lastPage;
        return { ...old, pages: newPages };
      });
    }
  });

  return () => {
    channel.unbind_all();
    getPusherClient().unsubscribe(`private-thread-${threadId}`);
  };
}, [threadId, adminId, queryClient]);
```

### 12. `components/layout/role-layout-client.tsx` — Mount NotificationDropdown

Add `<NotificationDropdown />` in the header row next to `MobileMenuButton`:

```tsx
import { NotificationDropdown } from "@/app/features/notifications/components/notification-dropdown";

// In the header flex row:
<div className="flex items-center gap-2 px-4 pt-4 pb-2 lg:hidden">
  <MobileMenuButton />
  <div className="ml-auto">
    <NotificationDropdown messagesBasePath="" />{" "}
    {/* empty = not clickable in non-admin roles yet */}
  </div>
</div>;
```

(When recruiter messaging is built later, pass the recruiter messages base path.)

---

## Environment Variables

Add to `.env.example`:

```
# Pusher (realtime messaging)
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

Add actual values to `.env.local`.

---

## Package Installation

```bash
npm install pusher pusher-js
```

---

## Data Flow

### Sending a message (Admin → User)

1. Admin types message in ThreadView → FormData sent to `POST /api/admin/messages/[threadId]`
2. Server creates `Message` in Prisma
3. Server triggers `pusher.trigger("private-thread-{threadId}", "new-message", {...})`
4. Receiver's client (subscribed to same channel) receives event → appended to cache
5. Server creates `Notification` record for receiver
6. Server triggers `pusher.trigger("private-user-{receiverId}", "new-notification", {...})`
7. If receiver is online → bell badge updates instantly

### Receiving a notification

1. User subscribes to `private-user-{userId}` on app load (via `useRealtimeNotifications()` in NotificationDropdown)
2. Server triggers `new-notification` event on that channel
3. `useRealtimeNotifications` handler:
   - Increments unread count in query cache
   - Appends notification to infinite query cache
4. Bell icon re-renders with updated badge count

### Fallback

- If Pusher disconnects, `refetchInterval: 60_000` on `useAdminMessages` ensures messages catch up within 60s
- `refetchInterval: 30_000` on `useUnreadCount` ensures notification badge stays roughly current

---

## Edge Cases & Error Handling

- **Pusher auth fails:** Server returns 401, client Pusher SDK retries or drops subscription
- **Double-send:** Pusher events arrive with `event_id` — TanStack Query `setQueryData` is idempotent, duplicates won't break cache
- **Offline receiver:** Notification is persisted in Postgres via Prisma, delivered on next page load + polling
- **ThreadView unmounts during receive:** `useEffect` cleanup unsubscribes channel, prevents stale updates
- **`refetchInterval` + Pusher race:** Pusher appends message first, `refetchInterval` does full replacement — no duplicate display since React Query deduplicates by key

---

## Validation

1. `npm install pusher pusher-js` succeeds
2. `npx prisma generate` succeeds (no schema changes needed)
3. `npx tsc --noEmit` passes
4. `npm run lint` passes
5. Manual test: open admin messages in two browsers, send message from one → appears in realtime in the other
6. Manual test: send message → notification bell badge increments on receiver's screen
