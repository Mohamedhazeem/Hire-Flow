# Plan: Unread Message Badge in AccountPopover (Real-time via Pusher)

## Architecture

Two Pusher events on `private-user-{userId}`:

| Channel                     | Event                      | Direction                    | What It Does                                          |
| --------------------------- | -------------------------- | ---------------------------- | ----------------------------------------------------- |
| `private-user-{receiverId}` | `message-unread-increment` | `sendMessage` → **receiver** | Optimistic increment (+1) in query cache              |
| `private-user-{userId}`     | `message-unread-update`    | `getMessages` → **caller**   | Invalidates query → authoritative refetch from server |

The first event handles new messages instantly. The second event handles the read-decrement path and covers cross-device (device A reads → server broadcasts to device B's channel). 60s polling is the reconciliation safety net.

## Files to Create/Modify

### 1. CREATE: `app/features/messages/actions/get-unread-message-count.ts`

Server action returning total unread message count for the current user.

```ts
"use server";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";

export async function getUnreadMessageCount(): Promise<number> {
  const user = await requireRole(["user", "recruiter", "admin", "super_admin"]);
  return prisma.message.count({
    where: {
      receiverId: user.id,
      read: false,
      deletedAt: null,
      NOT: { hiddenFor: { has: user.id } },
    },
  });
}
```

### 2. CREATE: `app/features/public/hooks/use-unread-message-count.ts`

Hook wrapping the server action in `useQuery` with real-time updates via Pusher. Subscribes to both events:

- `message-unread-increment` → optimistic cache increment
- `message-unread-update` → invalidate query (authoritative re-fetch)

```ts
"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPusherClient } from "@/lib/pusher/pusher-client";
import { getUnreadMessageCount } from "@/app/features/messages/actions/get-unread-message-count";

export function useUnreadMessageCount(userId: string | undefined) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<ReturnType<typeof getPusherClient>["subscribe"]> | null>(
    null,
  );

  const query = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: () => getUnreadMessageCount(),
    enabled: !!userId,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!userId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`private-user-${userId}`);
    channelRef.current = channel;

    const onIncrement = () => {
      queryClient.setQueryData(
        ["messages", "unread-count"],
        (old: number | undefined) => (old ?? 0) + 1,
      );
    };

    const onUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    };

    channel.bind("message-unread-increment", onIncrement);
    channel.bind("message-unread-update", onUpdate);

    return () => {
      channel.unbind("message-unread-increment", onIncrement);
      channel.unbind("message-unread-update", onUpdate);
      pusher.unsubscribe(`private-user-${userId}`);
      channelRef.current = null;
    };
  }, [userId, queryClient]);

  return query;
}
```

### 3. MODIFY: `lib/services/message-service.ts`

Two changes:

**A) In `sendMessage()`** — fire `message-unread-increment` on the receiver's private channel (after creating message, alongside the existing `new-message` event):

```ts
// After the existing pusher.trigger for "new-message":
void pusher.trigger(`private-user-${message.receiverId}`, "message-unread-increment", {});
```

**B) In `getMessages()`** — fire `message-unread-update` on the caller's own private channel after marking messages as read (covers cross-device badge sync):

```ts
// After the `if (unreadIds.length > 0)` block:
if (unreadIds.length > 0) {
  void messageRepository.markAsRead(unreadIds);
  void markThreadNotificationsRead(threadId, userId);
  // Broadcast so the user's badge updates in real-time across devices.
  void pusher.trigger(`private-user-${userId}`, "message-unread-update", {});
}
```

### 4. MODIFY: `components/chat/use-thread-view.ts`

In the existing invalidation `useEffect` (line 78–86), add invalidation for the unread message count query key:

```ts
useEffect(() => {
  if (data && !hasInvalidatedThreads.current) {
    hasInvalidatedThreads.current = true;
    queryClient.invalidateQueries({ queryKey: [config.queryKey, "threads"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
  }
}, [data, queryClient, config.queryKey]);
```

This ensures the badge decrements when the user opens a thread and messages are marked as read (in the same tab). Cross-device is handled by the server-side Pusher broadcast in item 3B.

### 5. MODIFY: `app/features/public/components/account-popover.tsx`

- Import `useUnreadMessageCount`
- Call it with `user.id` from session
- Add badge to Messages link in the `links.map()` render

```tsx
// At component top, after session check:
const userId = (user as { id?: string })?.id;
const { data: unreadCount = 0 } = useUnreadMessageCount(userId);

// Inside the links.map() render, add to the Link JSX:
{
  href.includes("/messages") && unreadCount > 0 && (
    <span className="ml-auto size-5 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center leading-none">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
```

## Implementation Order

1. Create server action
2. Create hook with Pusher subscription
3. Add Pusher events to `messageService.sendMessage` and `messageService.getMessages`
4. Add cache invalidation to `useThreadView`
5. Modify AccountPopover to render badge
6. Write/update tests
7. Run validation: `tsc --noEmit`, lint, vitest

## Event Flow Summary

```
Scenario: User sends a message
──────────────────────────────
senderDevice                      server                       receiverDevice
     │                              │                              │
     │  POST sendMessage()           │                              │
     │ ─────────────────────────►    │                              │
     │                              │  create message in DB        │
     │                              │  pusher.trigger(             │
     │                              │    "private-thread-{id}",   │
     │                              │    "new-message", ...)      │
     │                              │  fireNotification(           │
     │                              │    "new-notification")      │
     │                              │  pusher.trigger(             │
     │                              │    "private-user-{recvId}", │
     │                              │    "message-unread-increment")│
     │                              │ ─────────────────────────►  │
     │                              │                              │ increment cache
     │                              │                              │ badge shows +1

Scenario: User opens a thread (messages marked as read)
─────────────────────────────────────────────────────────
deviceA (reads)                    server                       deviceB (other)
     │                              │                              │
     │  getMessages()               │                              │
     │ ─────────────────────────►    │                              │
     │                              │  markAsRead(unreadIds)       │
     │                              │  pusher.trigger(             │
     │                              │    "private-user-{userId}", │
     │                              │    "message-unread-update")  │
     │                              │ ─────────────────────────►  │
     │  return { messages }        │                              │ invalidate cache
     │ ◄─────────────────────────  │                              │ query refetches
     │                              │                              │ badge shows 0
     │  useThreadView:              │                              │
     │  invalidateQueries(          │                              │
     │    ["messages","unread-count"])                             │
     │  query refetches             │                              │
     │  badge shows 0               │                              │
```

## Edge Cases

| Scenario                                      | Expected Behavior                                                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| No unread messages                            | Badge not rendered                                                                                               |
| 1 unread message                              | Badge shows "1"                                                                                                  |
| 100+ unread                                   | Badge shows "99+"                                                                                                |
| User not authenticated                        | Component returns null (existing guard), hook not called                                                         |
| Session expires mid-session                   | Query refetch fails; last known count preserved (graceful)                                                       |
| No threads at all                             | `prisma.message.count` returns 0                                                                                 |
| All messages read                             | Count 0, no badge                                                                                                |
| Hidden messages exist (user in `hiddenFor`)   | Excluded from count                                                                                              |
| Deleted messages (`deletedAt != null`)        | Excluded from count                                                                                              |
| Pusher client unavailable                     | Hook returns early from `useEffect`; 60s polling still works                                                     |
| Cross-device: read on phone, badge on desktop | Server broadcasts `message-unread-update` → desktop invalidates → refetches                                      |
| Rapid consecutive sends                       | `message-unread-increment` increments from current cache value each time (race-safe via `old => (old ?? 0) + 1`) |
| Multiple messages marked read in one request  | `message-unread-update` triggers single invalidation → authoritative recount from DB                             |

## Test Requirements

### A. Server action unit test

**File:** `lib/test/unit/messages/get-unread-message-count.test.ts`

| #   | Test                                  | Assertion                                                                                                               |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | Returns correct unread count for user | Mock `requireRole` returns user; mock `prisma.message.count` returns 5; `expect(await getUnreadMessageCount())` toBe(5) |
| 2   | Returns 0 when no unread messages     | Same setup, mock count returns 0; result 0                                                                              |
| 3   | Excludes hidden messages              | Verify the Prisma where clause includes `NOT: { hiddenFor: { has: user.id } }`                                          |
| 4   | Excludes deleted messages             | Verify `deletedAt: null` in where clause                                                                                |
| 5   | Requires authentication               | Mock `requireRole` throws; action rejects                                                                               |
| 6   | Prisma error is propagated            | Mock `prisma.message.count` throws; action rethrows the error                                                           |

### B. Hook unit test

**File:** `lib/test/unit/messages/use-unread-message-count.dom.test.tsx`

| #   | Test                                                 | Assertion                                                                                      |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Returns count from server action                     | Render hook in test component; mock getUnreadMessageCount to return 5; assert query.data === 5 |
| 2   | Defaults to 0 before fetch completes                 | Assert query.data is undefined initially                                                       |
| 3   | Does not fetch when userId is undefined              | Mock getUnreadMessageCount; render with userId=undefined; assert queryFn never called          |
| 4   | Subscribes to private-user-{userId} channel          | Spy on getPusherClient; assert pusher.subscribe called with `private-user-{id}`                |
| 5   | Increments cache on `message-unread-increment` event | Simulate Pusher event; assert query.data incremented by 1                                      |
| 6   | Invalidates cache on `message-unread-update` event   | Simulate Pusher event; assert queryClient.invalidateQueries called with correct key            |
| 7   | Cleans up Pusher subscription on unmount             | Render then unmount; assert channel.unbind called for both events + pusher.unsubscribe called  |
| 8   | Sets refetchInterval to 60000                        | Assert queryOptions.refetchInterval === 60000                                                  |
| 9   | Only enabled when userId is truthy                   | Assert queryOptions.enabled === !!userId                                                       |

### C. AccountPopover DOM tests

**File:** `lib/test/components/account-popover.dom.test.tsx` — add to existing describe block

| #   | Test                                            | Assertion                                                                               |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Does not render badge when unread count is 0    | Mock server action → 0; open popover; assert no badge element in Messages link          |
| 2   | Renders badge with correct number (e.g., 5)     | Mock → 5; open popover; assert badge text is "5"                                        |
| 3   | Caps badge at "99+" when count > 99 (e.g., 150) | Mock → 150; open popover; assert badge text is "99+"                                    |
| 4   | Badge only on Messages link, not Dashboard      | Open popover; assert Dashboard link has no badge; Messages link has badge               |
| 5   | Badge renders for user role                     | Mock session → user; assert Messages link has `/user/messages` href + badge             |
| 6   | Badge renders for recruiter role                | Mock session → recruiter; assert Messages link has `/recruiter/messages` href + badge   |
| 7   | Badge renders for admin role                    | Mock session → admin; assert Messages link has `/admin/messages` href + badge           |
| 8   | Badge hidden when popover is closed             | Assert badge NOT visible in DOM when popover trigger not clicked                        |
| 9   | Multiple links with "messages" in path          | Super_admin has team+admin teams+admin messages; assert badge only on Messages not Team |
| 10  | Badge color/style matches design spec           | Assert class contains `bg-error`, `rounded-full`, `text-[10px]`, `font-bold`            |

### D. Service layer tests

**File:** `lib/test/unit/messages/message-service-pusher.test.ts` (or append to existing `message-service.test.ts`)

| #   | Test                                                                                        | Assertion                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `sendMessage` fires `message-unread-increment` on receiver's channel                        | Mock `pusher.trigger`; call `sendMessage`; assert `pusher.trigger` called with `private-user-{receiverId}` and `"message-unread-increment"`                                           |
| 2   | `getMessages` fires `message-unread-update` on caller's channel when unread exist           | Mock `messageRepository.findByThreadId` returning messages with unread; call `getMessages`; assert `pusher.trigger` called with `private-user-{userId}` and `"message-unread-update"` |
| 3   | `getMessages` does NOT fire `message-unread-update` when no unread messages                 | Mock all messages already read; assert `pusher.trigger` NOT called with `"message-unread-update"`                                                                                     |
| 4   | `sendMessage` still fires existing `new-message` event (regression guard)                   | Assert existing `private-thread-{threadId}` trigger still fires                                                                                                                       |
| 5   | `getMessages` still calls `markAsRead` and `markThreadNotificationsRead` (regression guard) | Assert both repositories are still called                                                                                                                                             |

### E. use-thread-view integration test

**File:** `lib/test/unit/messages/use-thread-view-unread.test.tsx`

| #   | Test                                                          | Assertion                                                                                                                         |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Invalidates `["messages", "unread-count"]` on first data load | Mock `useMessages` returning data; render hook; assert `queryClient.invalidateQueries` called with `["messages", "unread-count"]` |
| 2   | Only invalidates once (guard flag `hasInvalidatedThreads`)    | Render with data; change data ref; assert invalidation called exactly once for unread-count                                       |
| 3   | Does not invalidate on initial mount without data             | Mock `useMessages` loading; assert invalidation NOT called                                                                        |
| 4   | Existing invalidations still fire (notifications + threads)   | Assert both `["notifications"]` and `[config.queryKey, "threads"]` still invalidated alongside                                    |

## Mocking Strategy

### Hook test (`use-unread-message-count.dom.test.tsx`):

```ts
vi.mock("@/app/features/messages/actions/get-unread-message-count", () => ({
  getUnreadMessageCount: vi.fn(),
}));
vi.mock("@/lib/pusher/pusher-client", () => ({
  getPusherClient: vi.fn(),
}));
```

Pusher mock returns a fake channel with `bind`/`unbind` spies.

### AccountPopover test (`account-popover.dom.test.tsx`):

```ts
vi.mock("@/app/features/messages/actions/get-unread-message-count", () => ({
  getUnreadMessageCount: vi.fn(),
}));
vi.mock("@/lib/pusher/pusher-client", () => ({
  getPusherClient: () => null, // Disable Pusher in DOM tests
}));
```

Existing mocks (`useSession`, `useSignOut`, globals) remain unchanged.

### Service test (`message-service-pusher.test.ts`):

```ts
vi.mock("@/lib/pusher/pusher", () => ({
  pusher: { trigger: vi.fn() },
}));
```

## Future Considerations (Not in Scope)

- Sidebar badges for all 3 roles — user chose AccountPopover only
