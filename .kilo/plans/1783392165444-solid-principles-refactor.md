# SOLID Refactor Plan v2 — Target 9+ SOLID

## Current SOLID Score: 3.4/10 → Target: 9.2/10

## Goal
Eliminate structural duplication across 3 roles (admin, recruiter, user) for messages/threads: deduplicate hooks, extract Prisma into repositories, extract business logic into a service layer covering both READ and WRITE operations, while preserving every existing import path and runtime behavior.

## Design Decisions

### Decision 1: Factory accepts `(queryKey, apiBasePath)` not `(role, apiRole)`
- **Rationale:** User role's query key is `"user"` but API path is `/api/recruiter/`. Using `string` for both separates cache namespace from HTTP routing. Eliminates the ambiguity of `apiRole` vs `role` naming.
- **Consumer wrappers:**
  - Admin: `("admin", "/api/admin")`
  - Recruiter: `("recruiter", "/api/recruiter")`
  - User: `("user", "/api/recruiter")`

### Decision 2: Factory exports individual creator functions (ISP-compliant)
- Not a monolithic `createHooks()` — instead: `createUseMessages()`, `createUseSendMessage()`, `createUseDeleteMessage()`, `createUseDeleteThread()`, `createUseThreads()`, `createUseInvalidateThreads()`
- Barrel wrappers cherry-pick only what each role needs. User barrel omits `useDeleteThread`.

### Decision 3: User's type names aliased in barrel re-export
- `use-user-threads.ts` barrel: `export type { ThreadUser as UserThreadUser, ThreadLastMessage as UserThreadLastMessage, ThreadItem as UserThreadItem, ... }` — preserves all existing consumer imports.

### Decision 4: Phase 3 covers ALL operations (READ + WRITE), not just POST/DELETE
- GET routes contain significant business logic: mark-as-read, thread orchestration, relationship verification. Moving these to the service layer is critical for S and D principles.

### Decision 5: Shared Zod schema with param overrides instead of monolithic schema
- Admin requires `.url()` on `fileUrl`, recruiter doesn't. Service accepts `requireValidUrl: boolean` param rather than two different schemas. OR: use a base schema + admin-specific `.refine()` applied at the route level for the `.url()` constraint. **Preferred:** base schema in service with `validateUrl?: boolean` since the difference is one validation call, not structural.

### Decision 6: Rate limiter promoted to `lib/rate-limit.ts`
- Both admin and recruiter POST routes call `checkMessageRateLimit` from `app/features/recruiter/libs/`. Promoting to `lib/` removes the cross-feature dependency and makes it injectable by the service.

### Decision 7: `messageSelect` and `SendMessageSchema` single source in shared lib
- `messageSelect` → `lib/repositories/message-repository.ts` (repository owns the Prisma select shape)
- `SendMessageSchema` base → `lib/services/message-service.ts` (service owns the validation schema)

---

## Phase 1 — Hook Factory

### New files
- `app/features/shared/hooks/use-messages.ts` — factory
- `app/features/shared/hooks/use-threads.ts` — factory
- `app/features/shared/hooks/index.ts` — barrel (optional, wrappers import directly)

### Factory API

```typescript
// use-messages.ts
import type { MessageItem } from "@/components/chat/message-item";
export type { MessageItem };

export type SendMessagePayload = {
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
};

export function createUseMessages(queryKey: string, apiBasePath: string) {
  return (threadId: string) => useInfiniteQuery({
    queryKey: [queryKey, "messages", threadId],
    queryFn: ...fetch(`${apiBasePath}/messages/${threadId}?cursor=...`),
    ...
  });
}

export function createUseSendMessage(queryKey: string, apiBasePath: string) {
  return (threadId: string) => useMutation({
    mutationFn: (payload) => fetch(`.../${apiBasePath}/messages/${threadId}`, POST, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey, "messages", threadId] });
      queryClient.invalidateQueries({ queryKey: [queryKey, "threads"] });
    },
  });
}

export function createUseDeleteMessage(queryKey: string, apiBasePath: string) { ... }
export function createUseDeleteThread(queryKey: string, apiBasePath: string) { ... }
```

```typescript
// use-threads.ts
export function createUseThreads(queryKey: string, apiBasePath: string) {
  return () => useQuery({
    queryKey: [queryKey, "threads"],
    queryFn: () => fetch(`${apiBasePath}/threads`),
    refetchInterval: 60000,
  });
}

export function createUseInvalidateThreads(queryKey: string) {
  return () => { invalidateQueries([queryKey, "threads"]); };
}
```

### Modified files (re-export wrappers)

**Admin wrappers:**
- `app/features/admin/hooks/messages/use-admin-messages.ts` → 5-line barrel
- `app/features/admin/hooks/messages/use-admin-threads.ts` → 5-line barrel

**Recruiter wrappers:**
- `app/features/recruiter/hooks/messages/use-recruiter-messages.ts` → 5-line barrel
- `app/features/recruiter/hooks/messages/use-recruiter-threads.ts` → 5-line barrel

**User wrappers:**
- `app/features/user/hooks/messages/use-user-messages.ts` → 5-line barrel (no delete-thread export, uses apiBasePath="/api/recruiter")
- `app/features/user/hooks/messages/use-user-threads.ts` → 5-line barrel with type aliases

### Thread-view components — UNCHANGED
- `admin-thread-view.tsx` — unchanged (imports unchanged paths, same function signatures)
- `recruiter-thread-view.tsx` — unchanged
- `user-thread-view.tsx` — unchanged

### Message-page components — UNCHANGED
- `admin-message-page.tsx`, `recruiter-messages-page.tsx`, `user-messages-page.tsx` — unchanged

### Query key alignment verification
| Context | Key pattern | Matches? |
|---|---|---|
| Factory internal | `[queryKey, "messages", threadId]` | — |
| Factory internal | `[queryKey, "threads"]` | — |
| `config.queryKey` in thread-view | set to `"admin"`/`"recruiter"`/`"user"` | ✅ factory receives same string |
| `usePusherThread` (`use-pusher-thread.ts:24`) | `[queryKey, "messages", threadId]` | ✅ same pattern |
| `handleSubmit` invalidation (use-thread-view.ts:118) | `[config.queryKey, "threads"]` | ✅ same pattern |

---

## Phase 2 — Repository Layer

### New files
- `lib/repositories/message-repository.ts`
- `lib/repositories/thread-repository.ts`
- `lib/repositories/index.ts`

### `message-repository.ts`

```typescript
import { prisma } from "@/lib/prisma";

export const messageSelect = {
  id: true, senderId: true, content: true,
  fileUrl: true, fileName: true, fileSize: true, fileType: true,
  createdAt: true, read: true,
} as const;

export const messageRepository = {
  findByThreadId(threadId: string, take: number, cursor?: { id: string }) {
    return prisma.message.findMany({
      where: { threadId },
      take, orderBy: { createdAt: "desc" },
      ...(cursor ? { cursor, skip: 1 } : {}),
      select: messageSelect,
    });
  },

  create(data: {
    threadId: string; senderId: string; receiverId: string;
    content: string; fileUrl: string | null; fileName: string | null;
    fileSize: number | null; fileType: string | null;
  }) {
    return prisma.message.create({ data, select: { ...messageSelect, createdAt: true } });
  },

  markAsRead(messageIds: string[]) {
    if (messageIds.length === 0) return;
    return prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { read: true },
    });
  },

  deleteBySender(threadId: string, senderId: string) {
    return prisma.message.deleteMany({ where: { threadId, senderId } });
  },

  findById(messageId: string) {
    return prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, threadId: true },
    });
  },

  deleteById(messageId: string) {
    return prisma.message.delete({ where: { id: messageId } });
  },
};
```

### `thread-repository.ts`

```typescript
import { prisma } from "@/lib/prisma";

export const threadRepository = {
  groupByThread(userId: string) {
    return prisma.message.groupBy({
      by: ["threadId"],
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      _max: { createdAt: true },
    });
  },

  findLatestMessages(threadIds: string[]) {
    return prisma.message.findMany({
      where: { threadId: { in: threadIds } },
      orderBy: { createdAt: "desc" },
      distinct: ["threadId"],
      select: {
        threadId: true, content: true, createdAt: true,
        senderId: true, read: true, fileUrl: true, fileType: true,
      },
    });
  },

  findParticipants(userIds: string[]) {
    return prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, image: true, role: true },
    });
  },
};
```

### Modified files (6 API route files)

Each file replaces:
- `import { prisma } from "@/lib/prisma"` → no longer needed (or kept if used elsewhere in the file — in all 6 routes, `prisma` is ONLY used for message/thread queries, so the import is removed)
- Inline Prisma calls → repository method calls

Route files:
1. `app/api/admin/messages/[threadId]/route.ts`
2. `app/api/recruiter/messages/[threadId]/route.ts`
3. `app/api/admin/messages/[threadId]/[messageId]/route.ts`
4. `app/api/recruiter/messages/[threadId]/[messageId]/route.ts`
5. `app/api/admin/threads/route.ts`
6. `app/api/recruiter/threads/route.ts`

**What stays in route handlers:** auth (`requireRole`), HTTP parsing (`cursor`, `limit` from searchParams), pagination (`parseCursorParams`, `buildCursorMeta`), response shaping (`ok()`).

**Edge case: User role calls recruiter routes** — the repository layer has no concept of "user" vs "recruiter". The routes already accept `["recruiter", "user"]` in `requireRole`. Repository methods are role-agnostic. No change needed.

### Promoted rate limiter

- **Move:** `app/features/recruiter/libs/rate-limit-message.ts` → `lib/rate-limit.ts`
- **Rename export to:** `checkMessageRateLimit` unchanged (same name, new path)
- **Update imports:** Both admin and recruiter POST routes update their import path
- **Service layer** (Phase 3) imports from `@/lib/rate-limit`

---

## Phase 3 — Service Layer (Covers ALL Operations)

### New file
- `lib/services/message-service.ts`

### Service API

```typescript
// Shared schemas and types
export const SendMessageSchema = z.object({
  content: z.string().min(0).max(2000).default(""),
  fileUrl: z.string().optional(),  // base schema — no .url()
  fileName: z.string().min(1).max(255).optional(),
  fileSize: z.number().int().positive().optional(),
  fileType: z.string().min(1).max(100).optional(),
}).refine((data) => data.content.length > 0 || data.fileUrl, {
  message: "Message must contain text or a file attachment",
});

// Schema with URL validation (for admin role)
export function getSendMessageSchema(requireValidUrl = false) {
  if (!requireValidUrl) return SendMessageSchema;
  return SendMessageSchema.extend({
    fileUrl: z.string().url().optional(),
  });
}

export const messageService = {
  // GET /messages/[threadId]
  getMessages(params: {
    threadId: string;
    userId: string;
    role?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ messages: MessageItem[]; meta: CursorPaginationMeta }> { ... },

  // POST /messages/[threadId]
  sendMessage(params: {
    threadId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    body: unknown;
    requireValidUrl?: boolean;
  }): Promise<MessageWithCreatedAt> { ... },

  // DELETE /messages/[threadId] (delete all own messages in thread)
  deleteMyMessages(params: {
    threadId: string;
    userId: string;
  }): Promise<void> { ... },

  // DELETE /messages/[threadId]/[messageId] (delete single message)
  deleteSingleMessage(params: {
    threadId: string;
    userId: string;
    messageId: string;
  }): Promise<void> { ... },
};
```

### Service method implementations

```typescript
getMessages: async ({ threadId, userId, role, cursor, limit = 30 }) => {
  if (!isValidThreadId(threadId)) throw new ValidationError("Invalid thread ID format");
  if (!participatesInThread(threadId, userId)) throw new ValidationError("Not a participant");

  const otherUserId = getOtherUserId(threadId, userId);

  // Recruiter-only: verify applicant relationship on READ
  if (role === "recruiter" && otherUserId) {
    await verifyRecruiterApplicantRelationship(userId, otherUserId);
  }

  const { take, cursor: cursorVal } = parseCursorParams({ cursor, limit });
  const prismaCursor = cursorVal ? { id: cursorVal } : undefined;

  const messages = await messageRepository.findByThreadId(threadId, take, prismaCursor);
  const { items, meta } = buildCursorMeta(messages, limit);

  // Fire-and-forget mark-as-read
  const unreadIds = items.filter((m) => m.senderId !== userId && !m.read).map((m) => m.id);
  if (unreadIds.length > 0) void messageRepository.markAsRead(unreadIds);

  return { messages: items.reverse(), meta };
},
```

```typescript
sendMessage: async ({ threadId, senderId, senderName, senderRole, body, requireValidUrl = false }) => {
  if (!isValidThreadId(threadId)) throw new ValidationError("Invalid thread ID format");

  const otherUserId = getOtherUserId(threadId, senderId);
  if (!otherUserId) throw new ValidationError("Not a participant in this thread");

  // Rate limit
  await checkMessageRateLimit(senderId, otherUserId);

  // Recruiter-only: verify relationship
  if (senderRole === "recruiter") {
    await verifyRecruiterApplicantRelationship(senderId, otherUserId);
  }

  // Validate
  const schema = getSendMessageSchema(requireValidUrl);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((e) => e.message).join("; ") || "Invalid message");
  }

  // Create
  const message = await messageRepository.create({
    threadId, senderId, receiverId: otherUserId,
    content: parsed.data.content,
    fileUrl: parsed.data.fileUrl ?? null,
    fileName: parsed.data.fileName ?? null,
    fileSize: parsed.data.fileSize ?? null,
    fileType: parsed.data.fileType ?? null,
  });

  // Pusher
  void pusher.trigger(`private-thread-${threadId}`, "new-message", {
    message: { ...message, createdAt: (message.createdAt as Date).toISOString() },
    senderId,
  });

  // Notification
  void createNotification(otherUserId, "new_message", {
    threadId, senderId, senderName,
    preview: parsed.data.content.slice(0, 100),
    fileUrl: parsed.data.fileUrl ?? null,
    fileType: parsed.data.fileType ?? null,
  });

  return message;
},
```

```typescript
deleteMyMessages: async ({ threadId, userId }) => {
  if (!isValidThreadId(threadId)) throw new ValidationError("Invalid thread ID format");
  if (!participatesInThread(threadId, userId)) throw new ValidationError("Not a participant");
  await messageRepository.deleteBySender(threadId, userId);
},

deleteSingleMessage: async ({ threadId, userId, messageId }) => {
  if (!isValidThreadId(threadId)) throw new ValidationError("Invalid thread ID format");
  if (!participatesInThread(threadId, userId)) throw new ValidationError("Not a participant");

  const message = await messageRepository.findById(messageId);
  if (!message) throw new NotFoundError("Message not found");
  if (message.threadId !== threadId) throw new ValidationError("Message does not belong to this thread");
  if (message.senderId !== userId) throw new ValidationError("You can only delete your own messages");

  await messageRepository.deleteById(messageId);
},
```

### Thread list service (orchestration extracted from route)

Not a separate file — the GET /threads route handler already orchestrates 3 repository calls. The route handler IS thin enough at ~70 lines: it calls `threadRepository.groupByThread`, `threadRepository.findLatestMessages`, `threadRepository.findParticipants`, then composes the result. For target 9+ SOLID, extract this orchestration:

```typescript
// In lib/services/message-service.ts
getThreadList: async (userId: string) => {
  const threads = await threadRepository.groupByThread(userId);
  if (threads.length === 0) return [];

  const threadIds = threads
    .sort((a, b) => (b._max.createdAt?.getTime() ?? 0) - (a._max.createdAt?.getTime() ?? 0))
    .map((t) => t.threadId);

  const latestMessages = await threadRepository.findLatestMessages(threadIds);
  const latestByThread = new Map(latestMessages.map((m) => [m.threadId, m]));

  const otherUserIds = threadIds.map((id) => getOtherUserId(id, userId));
  const users = await threadRepository.findParticipants(otherUserIds);
  const userMap = new Map(users.map((u) => [u.id, u]));

  return threadIds
    .map((threadId) => {
      const otherId = getOtherUserId(threadId, userId);
      const user = userMap.get(otherId);
      const latest = latestByThread.get(threadId);
      if (!user) return null;
      return {
        threadId,
        user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role },
        lastMessage: latest
          ? {
              content: latest.content || (latest.fileUrl
                ? (latest.fileType?.startsWith("image/") ? "📷 Photo" : "📎 File")
                : ""),
              createdAt: latest.createdAt.toISOString(),
              senderId: latest.senderId,
              unread: latest.senderId !== userId && !latest.read,
            }
          : null,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);
},
```

After extraction, both `/api/admin/threads` and `/api/recruiter/threads` route handlers become ~15 lines:

```typescript
async function handleGET() {
  const user = await requireRole(["admin", "super_admin"]);
  const threads = await messageService.getThreadList(user.id);
  return ok(threads);
}
```

### Files modified in Phase 3

1. `app/api/admin/messages/[threadId]/route.ts`
2. `app/api/recruiter/messages/[threadId]/route.ts`
3. `app/api/admin/messages/[threadId]/[messageId]/route.ts`
4. `app/api/recruiter/messages/[threadId]/[messageId]/route.ts`
5. `app/api/admin/threads/route.ts`
6. `app/api/recruiter/threads/route.ts`

### Post-Phase 3 route handler sizes

| Route | Current | After | Reduction |
|---|---|---|---|
| admin `[threadId]` GET | ~38 lines | ~12 lines | -68% |
| admin `[threadId]` POST | ~58 lines | ~15 lines | -74% |
| admin `[threadId]` DELETE | ~18 lines | ~8 lines | -55% |
| admin `[messageId]` DELETE | ~38 lines | ~10 lines | -74% |
| admin `threads` GET | ~66 lines | ~10 lines | -85% |
| recruiter `[threadId]` GET | ~44 lines | ~14 lines | -68% |
| recruiter `[threadId]` POST | ~62 lines | ~17 lines | -73% |
| recruiter `[threadId]` DELETE | ~20 lines | ~8 lines | -60% |
| recruiter `[messageId]` DELETE | ~38 lines | ~10 lines | -74% |
| recruiter `threads` GET | ~80 lines | ~10 lines | -87% |

---

## Phase Order & Dependencies

```
Phase 1 (Hook Factory)       → no external deps
Phase 2 (Repository Layer)   → no deps on Phase 1 (parallelizable)
Phase 2.5 (Rate limiter promotion) → no deps
Phase 3 (Service Layer)      → depends on Phase 2 + Phase 2.5
```

**Recommended execution order:** 1 → 2 (with 2.5) → 3

---

## Edge Case Matrix

| # | Edge case | Risk | Resolution |
|---|---|---|---|
| E1 | User role calls `/api/recruiter/messages/` not `/api/user/` | Runtime 404 if factory derives path from queryKey | Factory accepts `apiBasePath` as separate string param. User barrel passes `("user", "/api/recruiter")`. |
| E2 | `usePusherThread` constructs `[queryKey, "messages", threadId]` | Cache key mismatch | Factory uses same `queryKey` string. Zero mismatch. |
| E3 | `handleSubmit` invalidates `[config.queryKey, "threads"]` | Thread list stale | Factory's `onSuccess` also invalidates `[queryKey, "threads"]`. Redundant but safe. |
| E4 | User exports `UserThreadUser` type — factory exports `ThreadUser` | Broken imports in consumer files | Barrel re-export aliases: `export type { ThreadUser as UserThreadUser, ... }` |
| E5 | User has no `useDeleteThread` | Component would have undefined `useDeleteThread` | Factory exports it but user barrel omits it. `ThreadViewHooks.useDeleteThread` is optional (`?`). |
| E6 | Admin schema requires `fileUrl: z.string().url()` but recruiter doesn't | Admin accepts invalid URLs if schema is unified | Service exposes `getSendMessageSchema(requireValidUrl)` factory. Admin POST passes `requireValidUrl: true`. |
| E7 | Rate limiter lives in `app/features/recruiter/libs/` but admin imports it | Cross-feature coupling | Move to `lib/rate-limit.ts`. Both routes update import path. Service imports from `lib/`. |
| E8 | `messageSelect` duplicated in 2 route files | Divergent select shapes | Moved to `message-repository.ts` as shared const. |
| E9 | Recruiter GET has `verifyRecruiterApplicantRelationship` — admin GET doesn't | Behavioral regression | Service's `getMessages` accepts optional `role` param. Only calls `verifyRecruiterApplicantRelationship` when `role === "recruiter"`. |
| E10 | Recruiter POST has same relationship check — admin POST doesn't | Behavioral regression | Same pattern: `sendMessage` accepts `senderRole`, only verifies for `"recruiter"`. |
| E11 | `parseCursorParams` + `buildCursorMeta` produce `take+1` pattern | Protocol break if service miscalculates | Pagination helpers stay in route handler. Service receives already-parsed `cursor?` + `limit`. |
| E12 | Empty thread list (no messages ever) | `threadRepository.groupByThread` returns `[]` → service returns `[]` immediately. Matches current behavior. | ✅ |
| E13 | Pusher returns stale data | No change — service calls `pusher.trigger(...)` exactly as route does now. | ✅ |
| E14 | Notification creation fails silently | Already `void`-ed. Service preserves same fire-and-forget pattern. | ✅ |
| E15 | Route handler imports removed (`prisma`, `pusher`, `createNotification`, `rate-limit-message`) | Compilation errors if still referenced elsewhere | Each file is self-contained — unused imports are simply removed. |
| E16 | `verifyRecruiterApplicantRelationship` path changes | Import from `@/app/features/recruiter/libs/` in service creates cross-feature coupling | Service imports from the same path the recruiter route currently does. Acceptable coupling — only the recruiter role calls it. If promoted later, create `lib/verify-relationship.ts`. |

---

## SOLID Score Calculation

| Principle | Before | After | Reason |
|---|---|---|---|
| **S** Single Responsibility | 3/10 | 9/10 | Hooks: query logic only. Repos: data access only. Service: business logic + orchestration. Routes: HTTP + auth + response. Each layer has one job. |
| **O** Open/Closed | 2/10 | 10/10 | Factory accepts strings — new role = new barrel wrapper, zero factory changes. Repos extend by adding methods. Service extends by composing new methods. Closed for modification, open for extension. |
| **L** Liskov Substitution | 6/10 | 9/10 | All role hooks return identical shapes. User's `/api/recruiter` asymmetry handled by apiBasePath parameter, not behavioral override. Type aliasing preserves interfaces. |
| **I** Interface Segregation | 4/10 | 9/10 | 6 independent creator functions in factory — consumers import only what they need. Repos have narrow methods per operation. Routes no longer export handlers they don't use. |
| **D** Dependency Inversion | 2/10 | 9/10 | Hooks depend on abstract `apiBasePath` + `queryKey`, not hardcoded strings. Routes depend on repository interfaces, not inline Prisma. Services depend on repository contracts, not DB calls. |
| **Overall** | **3.4/10** | **9.2/10** | |

---

## Validation

```bash
# After Phase 1
npx tsc --noEmit
# Check: admin, recruiter, user message pages load without 404s

# After Phase 2
npx tsc --noEmit
# Check: all 6 route files no longer import prisma directly

# After Phase 3
npx tsc --noEmit
# Check: all 6 route files are <25 lines each

# Full smoke test
npx tsc --noEmit && npm run lint
# Manual: send message, delete message, delete thread, view threads
# All 3 roles
```

---

## Files Touched (Complete List)

### Created (7)
1. `app/features/shared/hooks/use-messages.ts`
2. `app/features/shared/hooks/use-threads.ts`
3. `lib/repositories/message-repository.ts`
4. `lib/repositories/thread-repository.ts`
5. `lib/repositories/index.ts`
6. `lib/services/message-service.ts`
7. `lib/rate-limit.ts` (promoted from recruiter libs)

### Modified (14)
1. `app/features/admin/hooks/messages/use-admin-messages.ts` → barrel
2. `app/features/admin/hooks/messages/use-admin-threads.ts` → barrel
3. `app/features/recruiter/hooks/messages/use-recruiter-messages.ts` → barrel
4. `app/features/recruiter/hooks/messages/use-recruiter-threads.ts` → barrel
5. `app/features/user/hooks/messages/use-user-messages.ts` → barrel (no delete-thread)
6. `app/features/user/hooks/messages/use-user-threads.ts` → barrel + type aliases
7. `app/api/admin/messages/[threadId]/route.ts` → Phase 2 + 3
8. `app/api/recruiter/messages/[threadId]/route.ts` → Phase 2 + 3
9. `app/api/admin/messages/[threadId]/[messageId]/route.ts` → Phase 2 + 3
10. `app/api/recruiter/messages/[threadId]/[messageId]/route.ts` → Phase 2 + 3
11. `app/api/admin/threads/route.ts` → Phase 2 + 3
12. `app/api/recruiter/threads/route.ts` → Phase 2 + 3

### Deleted (1)
13. `app/features/recruiter/libs/rate-limit-message.ts` → replaced by `lib/rate-limit.ts`

### UNCHANGED (zero-touch)
- All 3 thread-view components
- All 3 message-page components
- `components/chat/shared-thread-view.tsx`
- `components/chat/use-thread-view.ts`
- `components/chat/use-pusher-thread.ts`
- `lib/pagination.ts`
- `lib/api-wrapper.ts`
- `lib/api-error.ts`
- `lib/notifications.ts`
- `lib/thread-utils.ts`
- `lib/prisma.ts`
- Any user/presence/notification stores
- Any migration or schema files
