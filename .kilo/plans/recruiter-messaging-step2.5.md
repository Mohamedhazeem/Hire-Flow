# Step 2.5: Recruiter Direct Messaging (Thread‑Based)

## Goal
Recruiters can have threaded, persistent conversations with applicants, reusing the admin messaging system. Users (applicants) can reply from their own messages page. All realtime via Pusher — matching the admin pattern exactly.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API approach | REST API routes | Match admin pattern; reuse `withErrorHandler`, cursor pagination, Pusher triggers |
| Data model | Pure `Message` model reuse | No new Prisma entity. `threadId` convention `[smallerUserId]_[largerUserId]` |
| Tenant clearance | Query-time `verifyRecruiterApplicantRelationship()` utility | Throws `ForbiddenError` if applicant never applied to recruiter's company |
| Notifications | Yes — reuse `Notification` model + Pusher `private-user-{id}` | Match admin behavior exactly |
| Rate limiting | 20 msgs/hr per `(senderId, receiverId)` pair | Checked in POST route handler before message creation |
| Table trigger | Navigate to `/recruiter/messages?thread={threadId}` | Opens messages page inline; same as admin UX pattern |
| Withdrawn apps | Relationship check allows ANY past application | Recruiter can message rejected/withdrawn applicants |
| User reply page | Included in Step 2.5 | Basic `/user/messages` page so messaging is bidirectional |

---

## Files to Create (13)

### Shared Utility

#### 1. `app/features/recruiter/libs/verify-recruiter-applicant-relationship.ts`
```typescript
export async function verifyRecruiterApplicantRelationship(
  recruiterId: string,
  applicantId: string,
): Promise<void> {
  // Check applicant has ANY application to a job at a company where this recruiter
  // is a member (via CompanyTeamMember) or is the direct job poster (via Job.recruiterId)
  const application = await prisma.application.findFirst({
    where: {
      userId: applicantId,
      job: {
        OR: [
          { recruiterId },
          { company: { teamMembers: { some: { userId: recruiterId } } } },
        ],
      },
    },
    select: { id: true },
  });
  if (!application) throw new ForbiddenError("Applicant did not apply to any job at your company");
}
```

### API Routes (4 files)

#### 2. `app/api/recruiter/threads/route.ts` — List threads for recruiter
- `GET` — `requireRole(["recruiter"])` returns `companyId`
- Group `Message` by `threadId` where recruiter is sender or receiver
- Fetch latest message per thread, other user info
- **Tenant filter**: only include threads where the other user has applied to a job at the recruiter's company (join through `Application.job.companyId`)
- Return same shape as admin threads API: `{ threadId, user, lastMessage }`

#### 3. `app/api/recruiter/messages/[threadId]/route.ts` — Thread CRUD
- `GET` — Cursor-paginated messages. Validate thread participant (`threadId.includes(recruiterId)`). Mark unread as read. Tenant check via `verifyRecruiterApplicantRelationship`.
- `POST` — **Rate limit check**: count messages in last hour for `(senderId, receiverId)`, throw if >= 20. Validate with shared `SendMessageSchema`. Create `Message`. Fire Pusher `private-thread-{threadId}` event. Create `Notification` for receiver. Fire Pusher `private-user-{receiverId}` notification event.
- `DELETE` — Delete all messages in thread. Participant check.

#### 4. `app/api/recruiter/messages/search/route.ts` — Search applicants
- `GET` — `?q=` search. Query `Application` joined with `User` where `Application.job.companyId` matches recruiter's company. Return users matching name/email. Used by `StartConversationSearch` on recruiter messages page.

#### 5. `app/api/recruiter/applications/[applicationId]/profile/route.ts` — Applicant user lookup
- `GET` — Returns user name + email for a given application. Used by ThreadView header (matches admin's `/api/admin/users/:id` pattern). Tenant-scoped by verifying application belongs to recruiter's company.

### Hooks (4 files, under `features/recruiter/hooks/messages/`)

#### 6. `app/features/recruiter/hooks/messages/use-recruiter-threads.ts`
- `useRecruiterThreads()` — `useQuery({ queryKey: ["recruiter", "threads"], refetchInterval: 60_000 })`, calls `GET /api/recruiter/threads`
- Export `useInvalidateRecruiterThreads()` for mutations

#### 7. `app/features/recruiter/hooks/messages/use-recruiter-messages.ts`
- `useRecruiterMessages(threadId)` — `useInfiniteQuery` with cursor pagination, `refetchInterval: 60_000`, calls `GET /api/recruiter/messages/[threadId]`
- `useSendMessage(threadId)` — `useMutation`, POST, invalidates threads + messages
- `useDeleteMessage(threadId)` — `useMutation`, DELETE single message, optimistic cache removal
- `useDeleteThread()` — `useMutation`, DELETE thread, removes query + invalidates

### Components (2 files)

#### 8. `app/features/recruiter/components/recruiter-messages-page.tsx`
- Client component for `/recruiter/messages`
- Split-panel layout matching admin messages page:
  - Left: thread list + `StartConversationSearch` (reused from `@/components/shared/start-conversation-search` with search endpoint `/api/recruiter/messages/search` and base path `/recruiter/messages`)
  - Right: `ThreadView` (reused from admin) with `onBack` handler
- URL-driven via `?thread=` search param
- Responsive: mobile toggles between list/thread view

#### 9. `app/features/user/components/user-messages-page.tsx`
- Client component for `/user/messages`
- Same split-panel layout as recruiter/admin
- Left: thread list (user can see all threads they participate in)
- Right: `ThreadView` — reused from admin
- URL-driven via `?thread=`
- User sends message → `POST /api/recruiter/messages/[threadId]` (same API endpoint, since the Message model is role-agnostic)

### Pages (2 files)

#### 10. `app/(roles)/recruiter/messages/page.tsx`
```typescript
import { Suspense } from "react";
import { RecruiterMessagesPage } from "@/app/features/recruiter/components/recruiter-messages-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 min-h-0 flex items-center justify-center"><p className="text-text-muted">Loading messages...</p></div>}>
      <RecruiterMessagesPage />
    </Suspense>
  );
}
```

#### 11. `app/(roles)/user/messages/page.tsx`
- Same pattern as recruiter messages page but uses `/user/messages` path
- Suspense wrapper, renders `UserMessagesPage` component

### Applicants Table Update (1 file)

#### 12. `app/features/recruiter/components/applicants-table.tsx` — Add message action
- Add `MessageSquareTextIcon` button in the actions column
- Visible for all application statuses (not gated by status transitions — messaging is always available)
- Computes `threadId = computeThreadId(recruiterId, applicant.userId)`
- `onClick={() => router.push(/recruiter/messages?thread=${threadId})}`
- Import `computeThreadId` utility or compute inline

### Rate Limiting Helper (1 file)

#### 13. `app/features/recruiter/libs/rate-limit-message.ts`
```typescript
import { prisma } from "@/lib/prisma";
import { TooManyRequestsError } from "@/lib/api-error";

const MAX_MESSAGES_PER_HOUR = 20;

export async function checkMessageRateLimit(senderId: string, receiverId: string): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 3600000);
  const count = await prisma.message.count({
    where: {
      senderId,
      receiverId,
      createdAt: { gte: oneHourAgo },
    },
  });
  if (count >= MAX_MESSAGES_PER_HOUR) {
    throw new TooManyRequestsError("Message limit reached. Max 20 messages per hour.");
  }
}
```

Need to also add `TooManyRequestsError` to `lib/api-error.ts` (export class, register in `ERROR_STATUS_MAP` as 429).

---

## Files to Modify (4)

### 14. `lib/api-error.ts` — Add `TooManyRequestsError`
```typescript
export class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}
```
Register in `ERROR_STATUS_MAP` in `lib/api-wrapper.ts`:
```typescript
[TooManyRequestsError.name]: 429,
```

### 15. `app/features/recruiter/components/applicants-table.tsx` — Add message column button
- Add `MessageSquareTextIcon` import from `lucide-react`
- Add `useRouter` from `next/navigation`
- In the actions column, add a `MessageSquareTextIcon` button for every row
- The button computes `threadId` from the applicant's `userId` (available from the row data) and the recruiter's ID from `useSession()`
- `onClick={() => router.push(...)}`

### 16. `prisma/schema.prisma` — Add `applicationId` to `Message` model
- Wait — decision was **no** new field. Skip this.

### 17. `app/(roles)/user/layout.tsx` — Verify user role layout exists (it should)
- Ensure the user layout mirrors the recruiter/admin pattern with `RoleLayoutClient` + sidebar
- If user messages page needs a sidebar link, add it to the user's sidebar component

### 18. `app/features/user/components/user-sidebar.tsx` — Add Messages link
- Add `MessageSquareTextIcon` + `/user/messages` link to the user sidebar navigation

---

## Edge Cases Addressed

| # | Edge Case | Handling |
|---|-----------|----------|
| 1 | Recruiter messages applicant who never applied | `verifyRecruiterApplicantRelationship` throws `ForbiddenError` (403) |
| 2 | Applicant applies to 2 jobs, 1 thread per recruiter | Correct — threadId is per (recruiter, applicant) pair, not per job |
| 3 | Applicant replies | Allowed — their userId is in the threadId. Relationship check is bi-directional |
| 4 | Recruiter A vs Recruiter B at same company | Different threads. No shared inbox. Each recruiter has their own thread with the applicant |
| 5 | User computes someone else's threadId | `GET` route checks `threadId.includes(currentUserId)` — rejects non-participants |
| 6 | Recruiter deletes account | Cascade deletes all their messages. Thread disappears naturally |
| 7 | Applicant withdraws or is rejected | Relationship check allows ANY past application — messaging still works |
| 8 | Rate limit exceeded | `checkMessageRateLimit` throws `TooManyRequestsError` (429) before message creation |
| 9 | Empty thread list | Recruiter: empty state with "Go to Applicants" CTA. User: empty state "No messages yet" |
| 10 | Pusher disconnects | `refetchInterval: 60_000` on both `useRecruiterMessages` and `useRecruiterThreads` |
| 11 | File upload in message | Reuses existing `/api/upload` endpoint and `SendMessageSchema` from admin |
| 12 | User already subscribed to private channel | Pusher handles duplicate subscriptions gracefully |

---

## Data Flow

### Sending a Message (Recruiter → Applicant)
1. Recruiter clicks message icon in applicants table → `router.push(/recruiter/messages?thread={threadId})`
2. ThreadView mounts → `useRecruiterMessages(threadId)` fetches cursor-paginated history
3. Recruiter types and sends → POST `/api/recruiter/messages/[threadId]`
4. Server: rate limit check → `verifyRecruiterApplicantRelationship` → create `Message` → Pusher thread event → create `Notification` → Pusher notification event
5. Both recruiter and applicant's ThreadViews receive Pusher event → message appears in realtime
6. Applicant's bell badge updates from `NotificationDropdown` subscription

### Replying (Applicant → Recruiter)
1. Applicant navigates to `/user/messages?thread={threadId}` (from notification bell click or direct nav)
2. Same ThreadView component, same API endpoint
3. Relationship check verifies: "did this applicant apply to any of this recruiter's jobs?" — yes, passes
4. Message created, Pusher events fire for both thread and notification to recruiter

---

## Validation

1. `npx prisma generate` passes (no schema changes)
2. `npx tsc --noEmit` passes
3. `npm run lint` passes — no new warnings
4. Manual: recruiter messages applicant → message appears in realtime on applicant's browser
5. Manual: applicant replies → recruiter sees it in realtime
6. Manual: rate limit → send 21 messages in 1 second → 429 on the 21st
7. Manual: non-applicant user sees thread → 403 Forbidden
8. Manual: verify Pusher events fire by checking Pusher debug console

---

## Open Items (Deferred)

- **Shared team inbox** — not in scope. Each recruiter has independent threads with applicants.
- **Message search** — not in scope. No full-text search on messages.
- **User notification bell** — already works via `NotificationDropdown` in `RoleLayoutClient`.
- **Email notifications for offline users** — deferred to Phase 5.
