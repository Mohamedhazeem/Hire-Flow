# Message System Fixes

## Context

The message system serves **three roles**: admin, recruiter, user. Realtime via Pusher (`private-thread-{threadId}`). Thread IDs are sorted concatenation of both participant IDs with `_`.

## Critical Issues (blocking production)

### 1. Pusher auth lacks channel-level authorization — `app/api/pusher/auth/route.ts`

**Problem**: Authorizes any authenticated user to any `private-*` channel. Attacker can subscribe to `private-thread-{otherUsersThread}` and read all messages.

**Fix**: Parse channel name. If `private-thread-`, extract both IDs from the thread key, verify `session.user.id` matches one of them. Return 403 otherwise.

```ts
if (channelName.startsWith("private-thread-")) {
  const threadId = channelName.slice("private-thread-".length);
  const parts = threadId.split("_");
  if (parts.length !== 2 || !parts[0] || !parts[1])
    return new Response("Invalid channel", { status: 403 });
  if (session.user.id !== parts[0] && session.user.id !== parts[1])
    return new Response("Not a participant", { status: 403 });
}
```

### 2. User messaging completely broken — `features/user/hooks/messages/*.ts`

**Problem**: `use-user-messages.ts:44` and `use-user-threads.ts:32` call `/api/recruiter/messages/*` and `/api/recruiter/threads`, both gated by `requireRole(["recruiter"])`. Users get 403 on every operation.

**Fix**: Widen the existing recruiter endpoints to accept both `recruiter` and `user` roles. For `user` callers, verify the current user is the `receiverId` (not the `senderId` — only non-recruiters can be receivers in this system). This avoids duplicating 3+ route files.

Files to change:

- `app/api/recruiter/messages/[threadId]/route.ts` — all 3 handlers: change `requireRole(["recruiter"])` to `requireRole(["recruiter", "user"])`, add user-role participant verification (`receiverId === currentUser.id`).
- `app/api/recruiter/threads/route.ts` — same pattern.
- `app/api/recruiter/messages/[threadId]/[messageId]/route.ts` — same pattern (this file will be created by Fix 4).

### 3. Admin message POST has no rate limit — `app/api/admin/messages/[threadId]/route.ts`

**Problem**: `checkMessageRateLimit` is called in the recruiter POST handler but not in the admin POST handler. Admin can spam unlimited messages.

**Fix**: Import and call `checkMessageRateLimit(adminUser.id, otherUserId)` in the admin POST handler, same as recruiter.

**Risk**: Near-zero. Already-proven pattern.

### 4. Recruiter delete-single-message endpoint missing — `app/api/recruiter/messages/[threadId]/[messageId]/route.ts`

**Problem**: `useDeleteRecruiterMessage` calls `DELETE /api/recruiter/messages/${threadId}/${messageId}` but no route file exists. Admin has `app/api/admin/messages/[threadId]/[messageId]/route.ts`.

**Fix**: Create the missing file mirroring the admin handler. Guard with `requireRole(["recruiter", "user"])`. Verify sender owns the message. Delete only the single message, not all messages in the thread.

## Medium Issues (data integrity / UX)

### 5. Thread ID extraction uses fragile `indexOf` — 4 files

**Problem**: `recruiter/threads/route.ts:43`, `admin/threads/route.ts:44`, `recruiter/messages/*/route.ts:55-58,100-103`, `admin/messages/*/route.ts:88-91` use `id.indexOf("_" + currentUser.id)` which can match partial ID substrings.

**Fix**: Replace with `id.split("_")` — extract the non-current-user part directly.

```ts
// Before (fragile):
const otherUserId = id.slice(id.indexOf("_" + currentUser.id) + "_".length);

// After (exact):
const parts = id.split("_");
if (parts.length !== 2) {
  /* handle error */
}
const otherUserId = parts[0] === currentUser.id ? parts[1] : parts[0];
```

Apply to all 4 files. Each has 1-2 occurrences of this pattern.

### 6. Delete thread unilaterally destroys all messages — both DELETE handlers

**Problem**: Both admin and recruiter DELETE handlers call `prisma.message.deleteMany({ where: { threadId } })` — one party destroys the entire conversation for both parties.

**Fix**: Change to only delete messages sent by the current user:

```ts
await prisma.message.deleteMany({
  where: { threadId, senderId: currentUser.id },
});
```

### 7. Pusher callback duplicates messages — `admin/thread-view.tsx:110`, `user/user-thread-view.tsx:102`

**Problem**: Pusher `new-message` handler appends blindly. When `refetchInterval: 60_000` fires and re-fetches, the message already injected via Pusher appears as a duplicate bubble.

**Fix**: Before appending, check if `data.message.id` already exists in the cached pages:

```ts
const existingIds = new Set(data_.pages.flatMap((p) => p.data.messages.map((m) => m.id)));
if (existingIds.has(data.message.id)) return old;
```

### 8. Admin applicant detail queries overly broad thread match — `applicant-queries.ts:170-176`

**Problem**: `getAdminApplicantDetail` doesn't receive the admin's user ID. It uses `OR: [startsWith, endsWith]` on threadId, which can match threads from different admins talking to the same applicant.

**Fix**: Add `adminUserId` parameter to `getAdminApplicantDetail`. Build `[adminUserId, userId].sort().join("_")` for exact query.

- `app/features/admin/queries/applicant-queries.ts` — update function signature and message query
- `app/api/admin/applications/[applicationId]/detail/route.ts` — pass `currentUser.id` to the function (this value is already available from `requireRole` return)

### 9. Admin thread list never polls — `use-admin-threads.ts:33`

**Problem**: `useAdminThreads` lacks `refetchInterval`. Admin inbox only updates on manual send.

**Fix**: Add `refetchInterval: 60_000` to match recruiter and user thread hooks.

### 10. Long messages overflow — `message-bubble.tsx:154`

**Problem**: `whitespace-pre-wrap` doesn't break unbroken strings (long URLs, base64, code). Content overflows the bubble.

**Fix**: Add `break-words` Tailwind class. No behavioral change for text with spaces.

## Implementation Order

| #   | Fix                                        | Files                                                                                                                                  | Risk      |
| --- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Pusher auth channel check                  | `api/pusher/auth/route.ts`                                                                                                             | Low       |
| 2   | User messaging (widen recruiter endpoints) | `api/recruiter/messages/[threadId]/route.ts`, `api/recruiter/threads/route.ts`                                                         | Low       |
| 3   | Admin rate limit                           | `api/admin/messages/[threadId]/route.ts`                                                                                               | Near-zero |
| 4   | Recruiter delete-single-message            | `api/recruiter/messages/[threadId]/[messageId]/route.ts` (new)                                                                         | Low       |
| 5   | Thread ID `split` (4 files)                | `recruiter/threads/route.ts`, `admin/threads/route.ts`, `recruiter/messages/[threadId]/route.ts`, `admin/messages/[threadId]/route.ts` | Low       |
| 6   | Delete own messages only                   | Both DELETE handlers                                                                                                                   | Low       |
| 7   | Pusher deduplication                       | `admin/thread-view.tsx:110`, `user/user-thread-view.tsx:102`                                                                           | Low       |
| 8   | Admin recent messages scope                | `applicant-queries.ts`, `detail/route.ts`                                                                                              | Low       |
| 9   | Admin thread refetchInterval               | `use-admin-threads.ts`                                                                                                                 | Near-zero |
| 10  | break-words on bubble                      | `message-bubble.tsx:154`                                                                                                               | Near-zero |

## No Changes Needed (verified)

| Concern                              | Reality                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Server-side upload file validation   | Already present in `lib/upload.ts::ALLOWED_MIME_TYPES` + `MAX_FILE_SIZE_BYTES`, called by `saveUpload()` |
| `createNotification` `as never` cast | Runtime only, unrelated to these fixes                                                                   |
| Schema or migration changes          | None required                                                                                            |
| New dependencies                     | None required                                                                                            |

## Validation

After each fix:

1. `npm run lint` — no new errors
2. `npm run typecheck` — no type changes
3. Verify the fix is gated behind its role guard correctly
4. For Pusher auth, test with both valid and invalid channel subscriptions
