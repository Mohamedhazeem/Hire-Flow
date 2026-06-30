# Step 3.5 — Application Detail Enhancements (Withdraw, Timeline, Notifications)

## Goal
Enhance the existing application detail view at `/user/applications/[id]`:
1. Swap the inline timeline for the richer `StatusTimeline` shared component
2. Add recruiter notification on withdraw (currently the `DELETE` route silently deletes)
3. Extract `computeThreadId` to shared util (no functional change, just hygiene)
4. No "Message Recruiter" button — user cannot initiate threads; can only reply in recruiter-initiated threads

## Context
- Withdraw is a **hard delete** (confirmed by user). `handleDELETE` does `prisma.application.delete({ where: { id } })`. No changes to this behavior.
- User cannot start conversations — `UserThreadView` config confirms: `emptyMessage: "No messages yet. Wait for the recruiter to reach out."`
- `StatusTimeline` already exists at `components/shared/status-timeline.tsx` (147 lines) with icons, colors, relative timestamps, notes, changed-by names
- Current `ApplicationTimeline` (52 lines) is an inline render that doesn't use the shared component
- `computeThreadId` is duplicated in `start-conversation-search.tsx` — extract to `lib/thread-utils.ts`

## Files to Create/Modify

### 1. `lib/thread-utils.ts` (NEW, ~8 lines)
- Extract `computeThreadId` function:
  ```ts
  export function computeThreadId(idA: string, idB: string): string {
    const sorted = [idA, idB].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }
  ```

### 2. `app/features/user/components/application-timeline.tsx` (REWRITE, ~30 lines)
- Remove the inline dot-connector render
- Import and use `StatusTimeline` from `@/components/shared/status-timeline`
- Map `StatusChange[]` to `StatusTimelineEntry[]`:
  - `type: "status_change"` for all entries
  - `fromStatus`, `toStatus`, `id`, `createdAt` map directly
  - `label`: if no `fromStatus`, use `"Applied"`; else `"{fromStatus} → {toStatus}"` (formatted)
  - `changedByName`: `null` (user-facing, we don't store who)
  - `note`: `null` (no notes in user timeline)
- Fallback to single "Applied" entry if `statusChanges` is empty

### 3. `app/api/user/applications/[id]/route.ts` (MODIFY, ~7 lines added)
- Add `import { createNotification } from "@/lib/notifications"`
- Add `import { prisma } from "@/lib/prisma"` (already imported)
- In `handleDELETE`, after `prisma.application.delete(...)`:
  - Fetch the job's `recruiterId` (using the `application.jobId` we already have before delete)
  - Call `createNotification(job.recruiterId, "application_status", { applicationId: id, ... })` to notify the recruiter that the user withdrew
  - Use `void` on the notification call to not block the response (best-effort)
- **Don't** use `triggerForCompany` — only notify the job owner recruiter, not the whole company team

### 4. `components/shared/start-conversation-search.tsx` (MODIFY, ~3 lines changed)
- Replace the local `computeThreadId` function with `import { computeThreadId } from "@/lib/thread-utils"`
- Remove the local function definition

## Edge Cases Checklist

| # | Edge Case | Expected Behavior |
|---|---|---|
| EC1 | Withdraw on `interview_scheduled`/`offered`/`hired`/`rejected` | `ValidationError` returned (422) — unchanged from current code |
| EC2 | Withdraw on already-withdrawn app | `NotFoundError` because row was hard-deleted on first withdraw |
| EC3 | Recruiter notification fails (DB/Pusher error) | Withdraw succeeds — notification is `void`-fired, never blocks the response |
| EC4 | Job's `recruiterId` deleted (User cascade) | `application.job.recruiterId` still exists at delete time (we read it before deleting); after delete, job still references a user that `onDelete: Cascade` may have removed — notification will fail silently, which is fine |
| EC5 | Timeline with only "Applied" entry (no status changes in DB) | Shows single "Applied" entry with `type: "application_submitted"` |
| EC6 | Timeline with many status changes (10+) | All render as vertical timeline — no scroll/truncation needed |
| EC7 | User views application after withdraw | Redirected to `/user/applications` after withdraw (existing behavior); if they navigate to URL directly, `NotFoundError` (hard delete) |
| EC8 | `computeThreadId` import path change | Only affects `start-conversation-search.tsx` — no other files use this function |

## Files NOT Changed (no action needed)
- `application-header.tsx` — no changes
- `application-sections.tsx` — no changes
- `application-resume-section.tsx` — no changes
- `application-actions.tsx` — no changes (already uses `ConfirmActionButton`)
- `application-detail-view.tsx` — no changes (orchestrator stays the same)
- `user-application-queries.ts` — no changes needed (recruiter info not required for timeline swap)
- `user-thread-view.tsx` — no changes (handles empty threads correctly)
- `user-messages-page.tsx` — no changes
- `prisma/schema.prisma` — no changes (withdraw stays as hard delete)

## Verification Steps

1. **TypeScript**: `npx tsc --noEmit` — must pass with zero errors
2. **ESLint**: `npm run lint` — must pass with no new errors
3. **Timeline**: Open an application detail page — verify timeline shows "Applied" entry with proper icon/color/relative time
4. **Withdraw + Notification**: Withdraw an application — recruiter should receive an `application_status` notification with `data.applicationId` and `status: "withdrawn"` (check via `prisma.notification` table or recruiter's notification dropdown)
5. **Thread util**: Verify `computeThreadId` works in `start-conversation-search.tsx` (search + select a user)
6. **Component line count**: All components must stay ≤150 lines

## Future Considerations (not in scope)
- If user-initiated messaging is needed later, add a `POST /api/recruiter/threads` endpoint for users and a "Message Recruiter" button — but user confirmed this is not needed
- Soft-delete withdraw would require schema change (`@@unique` removal) — user confirmed hard delete is correct
