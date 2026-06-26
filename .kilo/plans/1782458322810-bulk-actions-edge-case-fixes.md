# Fix Plan: Step 2.7 Bulk Actions Edge Cases

**Date:** 2026-06-27
**Files:** 5 | **Changes:** 10 fixes

---

## Prioritization

| Tier | # | Issue | Severity | Status |
|------|---|-------|----------|--------|
| 1    | 1 | TOCTOU race in revert route | Critical | Pending |
| 1    | 2 | TOCTOU race in bulk status route | Critical | Pending |
| 1    | 3 | Bulk route overwrites `updatedAt`, breaks optimistic concurrency | Critical | Pending |
| 2    | 4 | Revert scoped to own changes with misleading error | High | Pending |
| 2    | 5 | No `useEffect` cleanup for feedback timeout | High | Pending |
| 2    | 6 | `rejectionReason` client-only required for bulk reject | High | Pending |
| 3    | 7 | `actionedIds` unbounded growth | Medium | Pending |
| 3    | 8 | DataTable `someSelected` doesn't exclude disabled rows | Medium | Pending |
| 3    | 9 | `totalPages` fallback misses zero | Medium | Pending |

---

## Tier 1 — Critical (Data Integrity)

### Fix 1 — TOCTOU Race in Revert Route

**File:** `app/api/recruiter/applications/[applicationId]/revert/route.ts`

**Problem:** `findFirst` for application (line 18) and `findFirst` for lastChange (line 27) execute **outside** `$transaction`. A concurrent request can change the applicant's status between read and write. The transaction wraps only writes (lines 38-59), so concurrent writes from other requests go into a different interactive transaction and are not serialized.

**Fix:** Move both `findFirst` calls **inside** the `$transaction` callback. The `NotFoundError` and `ValidationError` throws inside the callback will correctly bubble through `withErrorHandler`.

```ts
// BEFORE (lines 18-36 outside transaction)
const application = await prisma.application.findFirst({
  where: { id: applicationId, job: { companyId } },
  select: { id: true, userId: true, jobId: true, status: true },
});
if (!application) throw new NotFoundError("Application not found");
const lastChange = await prisma.applicationStatusChange.findFirst({
  where: { applicationId, changedById: session.id },
  orderBy: { createdAt: "desc" },
});
if (!lastChange) throw new ValidationError("No previous status change to revert");
const revertToStatus = lastChange.fromStatus;

await prisma.$transaction(async (tx) => {
  // ... writes
});

// AFTER
await prisma.$transaction(async (tx) => {
  const application = await tx.application.findFirst({
    where: { id: applicationId, job: { companyId } },
    select: { id: true, userId: true, jobId: true, status: true },
  });
  if (!application) throw new NotFoundError("Application not found");
  const lastChange = await tx.applicationStatusChange.findFirst({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });
  if (!lastChange) throw new ValidationError("No previous status change to revert");
  const revertToStatus = lastChange.fromStatus;

  const updateData: Record<string, unknown> = { status: revertToStatus };
  if (application.status === "rejected") updateData.rejectionReason = null;

  await tx.application.update({
    where: { id: applicationId },
    data: updateData,
  });
  await tx.applicationStatusChange.create({
    data: {
      applicationId,
      fromStatus: application.status,
      toStatus: revertToStatus,
      changedById: session.id,
      note: "Reverted",
    },
  });
});
```

**Changes from original:** `prisma.` → `tx.`, `changedById: session.id` removed (see Fix 4), throws moved inside callback, `revertToStatus` becomes local to callback.

### Fix 2 — TOCTOU Race in Bulk Status Route

**File:** `app/api/recruiter/applications/bulk/status/route.ts`

**Problem:** `findMany` (line 26) executes **outside** `$transaction`. Between the read and the `$transaction` start, another recruiter can change an applicant's status. The transition validation passes on stale data, and `updateMany` writes unconditionally with no `where` clause checking current status.

**Fix:** Move the `findMany` + transition validation loop **inside** the `$transaction`. The `NotFoundError` and `ValidationError` throws inside the callback will correctly bubble through `withErrorHandler`.

```ts
// BEFORE (lines 26-54 outside)
const applications = await prisma.application.findMany({
  where: { id: { in: applicationIds }, job: { companyId } },
  select: { id: true, userId: true, jobId: true, status: true, updatedAt: true, user: { select: { email: true } } },
});
if (applications.length !== applicationIds.length) throw new NotFoundError(...);
for (const app of applications) { const allowed = ALLOWED_TRANSITIONS[app.status]; if (!allowed?.includes(status)) throw new ValidationError(...); }
await prisma.$transaction(async (tx) => { ... });

// AFTER
await prisma.$transaction(async (tx) => {
  const applications = await tx.application.findMany({
    where: { id: { in: applicationIds }, job: { companyId } },
    select: { id: true, userId: true, jobId: true, status: true, updatedAt: true, user: { select: { email: true } } },
  });
  if (applications.length !== applicationIds.length) {
    throw new NotFoundError(`${applications.length} of ${applicationIds.length} applications found. Some applications do not exist or do not belong to your company.`);
  }
  for (const app of applications) {
    const allowed = ALLOWED_TRANSITIONS[app.status];
    if (!allowed?.includes(status)) {
      throw new ValidationError(`Application ${app.id}: cannot transition from "${app.status}" to "${status}"`);
    }
  }
  // ... existing writes (lines 57-91) unchanged
});
```

**Changes:** `prisma.` → `tx.`, entire read+validation block moves inside `$transaction`.

### Fix 3 — Remove Redundant `updatedAt` Overwrite

**File:** `app/api/recruiter/applications/bulk/status/route.ts` line 57

**Problem:** `updateData` manually stamps `updatedAt: new Date()`. Prisma schema already has `@updatedAt` (line 261 of `schema.prisma`) which auto-sets this on every write. After a bulk operation, the single-applicant PATCH route's optimistic concurrency check (which compares the client's `updatedAt` snapshot) will always fail for affected applicants.

**Fix:** Remove `updatedAt: new Date()` from the updateData object.

```ts
// BEFORE
const updateData: Record<string, unknown> = { status, updatedAt: new Date() };

// AFTER
const updateData: Record<string, unknown> = { status };
```

---

## Tier 2 — High (Functionality Bugs)

### Fix 4 — Revert Scoped to Own Changes

**File:** `app/api/recruiter/applications/[applicationId]/revert/route.ts` line 28

**Problem:** `where: { applicationId, changedById: session.id }` restricts revert to only the recruiter who made the change. In multi-recruiter teams, Recruiter A can never revert Recruiter B's changes, making the feature nearly unusable. The error message is misleading ("No previous status change to revert" when the change exists but was authored by someone else).

**Fix:** Remove the `changedById: session.id` filter. Tenant isolation is already enforced by `job: { companyId }` in the application query + `requireRole(["recruiter"])`. Error message stays — now it truly means no status change history exists.

*(Collapsed into Fix 1 — already removed in the rewritten code above.)*

### Fix 5 — `useEffect` Cleanup for Feedback Timeout

**File:** `app/features/recruiter/components/applicants-table.tsx`

**Problem:** `feedbackTimeoutRef.current` timeout is never cleared on component unmount. In React 19, `setFeedback(null)` will run on an unmounted component, logging a warning. With React Compiler, this could cause unpredictable behavior.

**Fix:** Add a `useEffect` import (add to existing import line) and cleanup effect before the render.

```tsx
// Add to import on line 3
import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// Add after line 207 (after showFeedback definition)
useEffect(() => {
  return () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  };
}, []);
```

### Fix 6 — `rejectionReason` Server-Side Validation

**File:** `app/features/recruiter/schema/application.schema.ts` lines 77-82

**Problem:** `rejectionReason` is `z.string().min(1).max(500).optional()`. The dialog enforces it client-side (button disabled when empty), but a direct API call via DevTools or cURL can reject applicants with no reason stored.

**Fix:** Add `.superRefine` making `rejectionReason` required when `status === "rejected"`.

```ts
export const BulkStatusTransitionSchema = z.object({
  applicationIds: z.array(z.string()).min(1).max(50),
  status: ApplicationStatusSchema,
  rejectionReason: z.string().min(1).max(500).optional(),
  email: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  if (data.status === "rejected" && (!data.rejectionReason || data.rejectionReason.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Rejection reason is required when rejecting",
      path: ["rejectionReason"],
    });
  }
});
```

---

## Tier 3 — Medium (Robustness & UX)

### Fix 7 — Cap `actionedIds` at 1000

**File:** `app/features/recruiter/components/applicants-table.tsx` line 153

**Problem:** Set grows monotonically with no eviction policy. In enterprise settings with frequent bulk operations on 10k+ applicants, this is a memory leak.

**Fix:** Add a helper function that caps the set at 1000, evicting oldest 20% when exceeded. Replace all `setActionedIds((prev) => { const n = new Set(prev); for (const id of ids) n.add(id); return n; })` calls (lines 225, 246) with the capped version.

```ts
// Add before the component or as a module-level function
const MAX_ACTIONED_IDS = 1000;

function addActionedIds(prev: Set<string>, ids: string[]): Set<string> {
  const next = new Set(prev);
  for (const id of ids) {
    if (next.size >= MAX_ACTIONED_IDS) break;
    next.add(id);
  }
  if (next.size !== prev.size + ids.length) {
    // Cap exceeded: evict oldest 20%
    const entries = [...next];
    const evictCount = Math.floor(entries.length * 0.2);
    for (let i = 0; i < evictCount; i++) next.delete(entries[i]);
  }
  return next;
}
```

```ts
// Line 225 — replace
setActionedIds((prev) => { const n = new Set(prev); for (const id of ids) n.add(id); return n; });
// with
setActionedIds((prev) => addActionedIds(prev, ids));

// Line 246 — same replacement
setActionedIds((prev) => addActionedIds(prev, ids));
```

### Fix 8 — `someSelected` Should Exclude Disabled Rows

**File:** `components/ui/data-table.tsx` lines 54-56

**Problem:** `someSelected` uses `data.some()` instead of `selectableRows.some()`. If only disabled rows are selected, the header checkbox shows indeterminate even though no selectable rows are selected.

**Fix:** Change `data` to `selectableRows` in the `.some()` call.

```ts
// BEFORE
const someSelected = enableSelection && data.some(
  (row) => selectedIds?.has(getRowId?.(row) ?? ""),
);

// AFTER
const someSelected = enableSelection && selectableRows.some(
  (row) => selectedIds?.has(getRowId?.(row) ?? ""),
);
```

### Fix 9 — `totalPages` Fallback for Zero

**File:** `app/features/recruiter/components/applicants-table.tsx` line 172

**Problem:** `responseData?.totalPages ?? 1` returns `0` when `totalPages: 0` (no applicants). Shows "Page 1 of 0".

**Fix:** Use `Math.max(1, ...)`.

```ts
// BEFORE
const totalPages = responseData?.totalPages ?? 1;

// AFTER
const totalPages = Math.max(1, responseData?.totalPages ?? 1);
```

---

## Files Summary

| # | File | Changes |
|---|------|---------|
| 1 | `app/api/recruiter/applications/[applicationId]/revert/route.ts` | Move all reads inside `$transaction`; remove `changedById: session.id` |
| 2 | `app/api/recruiter/applications/bulk/status/route.ts` | Move `findMany`+validation inside `$transaction`; remove `updatedAt: new Date()` |
| 3 | `app/features/recruiter/schema/application.schema.ts` | Add `.superRefine` to `BulkStatusTransitionSchema` |
| 4 | `app/features/recruiter/components/applicants-table.tsx` | Add `useEffect` cleanup, cap `actionedIds`, fix `totalPages` |
| 5 | `components/ui/data-table.tsx` | Change `someSelected` to use `selectableRows` |

No new files. No Prisma migrations. No manifest updates.

---

## Verification

```bash
npx tsc --noEmit
npx eslint app/api/recruiter/applications/[applicationId]/revert/route.ts app/api/recruiter/applications/bulk/status/route.ts app/features/recruiter/schema/application.schema.ts app/features/recruiter/components/applicants-table.tsx components/ui/data-table.tsx
```
