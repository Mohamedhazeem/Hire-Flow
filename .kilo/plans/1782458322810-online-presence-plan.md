# Online Presence — Green Dot + "Online" Label in Messages

## Goal

Display a green dot next to a user's name in the thread list and show "Online" under their name in the chat header when they are actively using the app. Available to all roles (admin, recruiter, user). Additive feature — zero impact on existing message flow.

## Design

**Pusher presence channels** (`presence-online-{userId}`). Each user subscribes to their own channel when they mount the messages page. The thread list subscribes to each unique partner's presence channel. Pusher broadcasts `member_added` / `member_removed` events automatically.

### Key rules
- No schema changes, no DB migrations, no new dependencies
- React Compiler handles memoization — no manual `useMemo`/`useCallback`
- `useEffect` only for Pusher subscribe/unsubscribe lifecycle
- Graceful degradation: Pusher failure → no dots shown, messaging continues normally

## Changed files

| File | Action | Notes |
|---|---|---|
| `app/api/pusher/auth/route.ts` | **Edit** | Add `presence-` channel handler |
| `features/messages/stores/presence-store.ts` | **New** | Zustand store for online user IDs |
| `components/chat/thread-list-item.tsx` | **New** | Shared `ThreadListItem` with green dot |
| `components/chat/shared-thread-view.tsx` | **Edit** | Add "Online" label under chat name |
| `app/(roles)/admin/messages/page.tsx` | **Edit** | Use shared ThreadListItem, mount presence hook |
| `app/features/recruiter/components/recruiter-messages-page.tsx` | **Edit** | Same |
| `app/features/user/components/user-messages-page.tsx` | **Edit** | Same |
| `lib/pusher-client.ts` | **Edit** | Enable presence channel auth |

## Implementation steps

### Step 1 — Extend Pusher auth handler for presence channels

**File:** `app/api/pusher/auth/route.ts`

Add a check before the existing `private-thread-` handler:

```
if channelName starts with "presence-online-"
  extract userId from channelName (strip "presence-online-" prefix)  
  if session.user.id !== extracted userId → return 403 (prevent spoofing)
  authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: session.user.id,
    user_info: { name: session.user.name },
  })
  return authResponse
```

Existing `private-thread-` handler remains unchanged. The `withErrorHandler` wrapper is not needed here because the function returns `Response` directly (not `NextResponse`), but error handling is manual — match the existing pattern.

### Step 2 — Create presence Zustand store

**File:** `features/messages/stores/presence-store.ts`

```ts
type PresenceState = {
  onlineUserIds: Set<string>;
  // Track subscriptions for cleanup: userId → subscribed boolean
  _subscriptions: Record<string, boolean>;
  subscribeToUser: (userId: string) => void;
  unsubscribeFromUser: (userId: string) => void;
  isOnline: (userId: string) => boolean;
  clear: () => void;
};
```

Implementation:
- `subscribeToUser(userId)`: guard if already subscribed. Get Pusher client, subscribe to `presence-online-{userId}`. Bind `member_added` → add to Set. Bind `member_removed` → delete from Set. Subscribe succeeds → the current user is already a member, so `member_added` fires immediately for themselves but we only care about *other* members. Pusher's `subscription_succeeded` callback provides initial member list. Use `channel.members.each(...)` to seed the initial set.
- `unsubscribeFromUser(userId)`: guard if not subscribed. Unbind all, unsubscribe channel, remove from tracking.
- `isOnline(userId)`: `onlineUserIds.has(userId)`.
- `clear()`: iterate subscriptions and unsubscribe all.

**Important:** The store should NOT be persisted (default Zustand behavior — no `persist` middleware). Resets on page reload, which is correct.

### Step 3 — Create shared ThreadListItem

**File:** `components/chat/thread-list-item.tsx`

```ts
type Props = {
  thread: { threadId: string; user: { id: string; name: string }; lastMessage: { content: string; createdAt: string; senderId: string; unread: boolean } | null };
  currentUserId: string;
  active: boolean;
  basePath: string;
  isOnline: boolean;
};
```

Render:
- Avatar circle with first letter (same gradient as current)
- Name + time row
- Gray "No messages yet" / message content
- Unread dot (existing)
- **Green dot:** `size-2.5 rounded-full bg-green-500 ring-2 ring-bg-surface` absolutely positioned at bottom-right of avatar, only when `isOnline` is true
- Chevron right icon (existing)

Use `router.push(\`${basePath}?thread=${thread.threadId}\`, { scroll: false })`.

### Step 4 — Create presence subscription hook

**File:** Inside `features/messages/stores/presence-store.ts` or a co-located `use-thread-presence.ts`:

```ts
export function useThreadPresence(threads: Array<{ user: { id: string } }>) {
  const subscribeToUser = usePresenceStore((s) => s.subscribeToUser);
  const unsubscribeFromUser = usePresenceStore((s) => s.unsubscribeFromUser);
  const clear = usePresenceStore((s) => s.clear);

  useEffect(() => {
    // Subscribe current user's own presence channel
    // (handled separately — the page component mounts this)
    
    // Subscribe to each unique partner
    const userIds = [...new Set(threads?.map((t) => t.user.id) ?? [])];
    userIds.forEach(subscribeToUser);
    return () => {
      userIds.forEach(unsubscribeFromUser);
    };
    // React Compiler handles deps, but this effect MUST re-run when threads change
    // So threads is the dependency
  }, [threads]);
}
```

### Step 5 — Update all three messages pages

Each page:
1. Import `ThreadListItem` from shared component
2. Import `usePresenceStore` for `isOnline(userId)` calls
3. Import `useThreadPresence` hook for lifecycle
4. Import own presence subscription hook (Step 6)
5. Remove inline `ThreadListItem`, `ThreadListSkeleton`, `ThreadListPanel` (or extract those too — but keep extraction minimal per constraints)
6. Pass `isOnline={isOnline(thread.user.id)}` to each `ThreadListItem`

### Step 6 — Subscribe current user to their own presence

**In each messages page** (or in a shared layout mount):

```ts
useEffect(() => {
  if (!userId) return;
  const pusher = getPusherClient();
  const channelName = `presence-online-${userId}`;
  const channel = pusher.subscribe(channelName);
  return () => {
    pusher.unsubscribe(channelName);
  };
}, [userId]);
```

This ensures the user's own presence channel is active as long as any messages page is mounted. Without this, no other user would see them as online.

### Step 7 — Enable presence auth in pusher-client

**File:** `lib/pusher-client.ts`

The existing `Pusher` constructor already has `authEndpoint: "/api/pusher/auth"`. Presence channels use the same auth endpoint but require `channel_data` in the response. The auth handler in Step 1 returns it. No client-side change needed — Pusher JS SDK automatically requests auth when subscribing to `presence-` channels using the configured `authEndpoint`.

### Step 8 — Add "Online" to SharedThreadView

**File:** `components/chat/shared-thread-view.tsx`

In the chat header (lines 340–345), change:
```
<div className="min-w-0">
  <h2 ...>{chatName || "Loading..."}</h2>
  <p className="text-[11px] text-text-muted">{config.roleLabel}</p>
</div>
```
To:
```
<div className="min-w-0">
  <h2 ...>{chatName || "Loading..."}</h2>
  {isOnline(otherUserId) ? (
    <p className="text-[11px] text-green-500 font-medium">Online</p>
  ) : (
    <p className="text-[11px] text-text-muted">{config.roleLabel}</p>
  )}
</div>
```

Import `usePresenceStore` and call `isOnline(otherUserId)`.

## Edge cases handled

| Case | Behavior |
|---|---|
| Pusher unavailable | No dots shown, messaging works |
| User deleted | Channel empty → not online |
| Multiple tabs | Pusher handles; online until last tab closes |
| Thread deletion (own side) | Own presence still active; partner still subscribed |
| Thread deletion (partner's side) | Partner's presence unaffected |
| New thread appears (search) | Effect re-runs, subscribes to new partner |
| Race condition on effect cleanup | Store guards double subscribe/unsubscribe |
| Auth spoof attempt (subscribe as another user) | Auth handler returns 403 |
| 50+ threads | One subscription per unique partner ID; Set auto-deduplicates |
| SPA navigation away/back | Cleanup unsubscribes; re-subscribes on return |
| Zero threads | Own presence active; no partner subscriptions |
| Admin messages admin | Both subscribe to each other's channels; both see online |

## Validation

After implementation:
1. `npm run lint` — 0 errors (pre-existing warnings only)
2. `npx tsc --noEmit` — 0 errors
3. Manual: open two browser windows as different users, verify green dot + "Online" label
4. Manual: close one window, green dot disappears within ~10s
5. Manual: open 3 tabs as same user, other user sees single "Online" status, no flicker
6. Manual: delete thread from one side, verify the other side still sees online status
7. Manual: navigate to dashboard, come back to messages, subscriptions restore
