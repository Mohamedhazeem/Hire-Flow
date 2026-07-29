# Step 2.7 — Bulk Actions for Selection

## Goal

Enable recruiters to select multiple applicants in the applicants table and perform bulk status transitions (review, shortlist, reject, etc.) in a single atomic operation — with tenant isolation, in-app notifications, and mobile-friendly UI.

---

## Key Design Decisions

| Decision                 | Choice                                                                        | Rationale                                                                            |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Concurrency model**    | Skip optimistic locking in bulk                                               | Bulk is a deliberate action; a stale entry shouldn't block the whole batch.          |
| **Email notifications**  | Design for future queue, don't build now                                      | Add `pendingEmail` flag on Notification data for future worker. In-app only for MVP. |
| **DataTable selection**  | Extend shared DataTable with optional selection props                         | Makes selection reusable across all role tables (admin, user).                       |
| **Bulk endpoint**        | `POST /api/recruiter/applications/bulk/status`                                | Separate route from single-status PATCH. Accepts array of IDs + target status.       |
| **Bulk rejection**       | Single shared `rejectionReason` string across all selected                    | Matches UX pattern — one dialog for all, not per-applicant.                          |
| **Database transaction** | Single `prisma.$transaction` for all updates + status changes + notifications | Atomic: all succeed or all roll back.                                                |
| **Tenant isolation**     | Single `findMany` with `where: { id: { in: ids }, job: { companyId } }`       | O(1) query validates all IDs belong to the recruiter's company.                      |

---

## Modified Files

### `components/ui/data-table.tsx` — Add optional row selection

Extend `DataTableProps` and `DataTable`:

```tsx
type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
  className?: string;
  // New optional selection props
  enableSelection?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  getRowId?: (row: TData) => string;
};
```

- When `enableSelection` is true, prepend a checkbox column (`TableHead` with "select all" checkbox + per-row checkbox in `TableCell`).
- "Select all" checkbox toggles all visible rows (current page), not all pages.
- Pass `selectedIds` and `onSelectionChange` for controlled state.
- The checkbox column uses `colSpan+1` for the empty state row.

### `app/features/recruiter/schema/application.schema.ts` — Add bulk schemas

```ts
export const BulkStatusTransitionSchema = z.object({
  applicationIds: z.array(z.string().cuid()).min(1).max(50),
  status: ApplicationStatusSchema,
  rejectionReason: z.string().min(1).optional(),
});

export type BulkStatusTransitionInput = z.infer<typeof BulkStatusTransitionSchema>;
```

- Max 50 IDs per batch — prevents runaway requests.
- `rejectionReason` is optional; only validated when `status === "rejected"`.

### `app/api/recruiter/applications/bulk/status/route.ts` — New bulk API route

```ts
// POST /api/recruiter/applications/bulk/status
async function handlePOST(request: NextRequest) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  // 1. Validate body
  const parsed = BulkStatusTransitionSchema.safeParse(body);
  // 2. Fetch all applications with tenant check
  const applications = await prisma.application.findMany({
    where: { id: { in: parsed.data.applicationIds }, job: { companyId } },
    select: { id: true, userId: true, jobId: true, status: true, user: { select: { email: true } } },
  });
  // 3. Validate all IDs found + transitions are allowed
  if (applications.length !== parsed.data.applicationIds.length) throw new NotFoundError("...");
  for (const app of applications) {
    if (!ALLOWED_TRANSITIONS[app.status]?.includes(status)) throw new ValidationError("...");
  }
  // 4. Execute in transaction
  await prisma.$transaction(async (tx) => {
    // 4a. Update all application statuses (no concurrency check)
    await tx.application.updateMany({
      where: { id: { in: ids } },
      data: { status, rejectionReason: rejectionReason ?? null, updatedAt: new Date() },
    });
    // 4b. Create ApplicationStatusChange records (one per application)
    await tx.applicationStatusChange.createMany({
      data: applications.map((a) => ({
        applicationId: a.id, fromStatus: a.status, toStatus: status,
        changedById: session.id, note: rejectionReason ?? null,
      })),
    });
    // 4c. Create in-app notifications
    await tx.notification.createMany({
      data: applications.map((a) => ({
        userId: a.userId, type: "application_status",
        data: { applicationId: a.id, jobId: a.jobId, previousStatus: a.status, newStatus: status, updatedBy: session.id, pendingEmail: false },
      })),
    });
  });
  // 5. Invalidate caches + return
  revalidatePath(...);
  return ok({ count: applications.length, status });
}
```

- **Tenant validation**: Single `findMany` with `job: { companyId }` ensures all returned apps belong to the recruiter's company. If count mismatch → `NotFoundError`.
- **Transition validation**: Loop checks each application's current status against `ALLOWED_TRANSITIONS`. If any are invalid, throw `ValidationError` with details.
- **Atomic**: All updates, status changes, and notifications in one `$transaction`. If any fails, everything rolls back.
- **`pendingEmail: false`** in notification data — future queue worker picks up records where `pendingEmail: true`.
- **Status map for rejection**: When `status === "rejected"`, the `rejectionReason` is written to application. For other statuses, `rejectionReason` is ignored.

### `app/features/recruiter/hooks/use-applications.ts` — Add bulk mutation hook

```ts
export function useBulkTransitionStatus(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkStatusTransitionInput) =>
      apiClient("/api/recruiter/applications/bulk/status", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applicants", jobId] });
    },
  });
}
```

### `app/features/recruiter/components/applicants-table.tsx` — Add selection + bulk action bar

Changes:

1. Add state: `[selectedIds, setSelectedIds] = useState<Set<string>>(new Set())`
2. Replace `columns` with a new array that prepends a selection checkbox column when needed (or inline it).
3. Add `enableSelection={true}`, `selectedIds`, `onSelectionChange`, `getRowId={(row) => row.id}` to the `<DataTable>`.
4. Add a **bulk action bar** rendered below the DataTable when `selectedIds.size > 0`:
   - Shows count: "N applicants selected"
   - Computes available bulk actions based on the **intersection of allowed transitions** across all selected applicants.
     - E.g., if all selected are in "applied" status → show "Start Review" and "Reject".
     - If mix of "applied" + "reviewing" → show "Reject" only (common allowed transition).
     - If any are in "hired"/"rejected" → show no bulk actions (terminal states).
   - "Select All N on this page" / "Clear selection" buttons.
   - Action buttons (Start Review, Shortlist, Schedule Interview, Send Offer, Mark Hired, Reject) mapped to the single dialog pattern.
5. Add a **BulkRejectDialog** (shared with `application-dialogs.tsx`) — single `rejectionReason` textarea for all selected.
6. On successful bulk mutation → clear selection, refetch.

Mobile: The bulk action bar is fixed at the bottom of the viewport on mobile (`fixed bottom-0` with safe-area padding) and inline below the table on desktop.

### `app/features/recruiter/components/application-dialogs.tsx` — Add BulkRejectDialog

New component:

```tsx
type BulkRejectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (rejectionReason: string) => void;
  isPending: boolean;
};
```

Simple dialog with:

- Title: "Reject N Applicants"
- Description: "Provide a rejection reason that will be applied to all N selected applicants."
- Single `Textarea` for `rejectionReason`.
- Cancel + Confirm buttons.

### `app/features/recruiter/components/applicant-detail-page.tsx` — No change

Bulk actions are table-level, not detail-page-level. No changes needed.

---

## Data Flow

```
User checks rows → selectedIds Set updated
User clicks bulk action button (e.g. "Reject")
  → If rejection: open BulkRejectDialog → user enters reason → confirm
  → mutation fires: POST /api/recruiter/applications/bulk/status
    → requireRole(["recruiter"])
    → Zod validate body (ids, status, optional rejectionReason)
    → findMany with tenant check (id IN ids AND job.companyId = session.companyId)
    → validate count === ids.length (all found)
    → validate each app's current status allows the transition
    → $transaction:
        updateMany applications → set new status
        createMany ApplicationStatusChange
        createMany Notification (with pendingEmail: false in data)
    → revalidate job applicants cache
    → return { count, status }
  → onSuccess: clear selection, invalidate query, show toast
```

---

## Edge Cases

| Case                                               | Handling                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Some IDs not found (not in company)                | `NotFoundError` — tell user "X of N applications not found or don't belong to your company"                                                                                          |
| Some apps are in a terminal state (hired/rejected) | Filter those out client-side before showing available actions. If user somehow sends them, reject the whole batch in the route with a `ValidationError` listing the problematic IDs. |
| Max batch size exceeded (>50)                      | Zod rejects with clear message                                                                                                                                                       |
| Mix of statuses with different allowed transitions | Show only the **intersection** of allowed transitions. E.g., if some are "applied" (can review/reject) and some are "reviewing" (can shortlist/reject), only "reject" is shown.      |
| No common allowed transition across all selected   | Disable action bar with message "No bulk actions available for this selection"                                                                                                       |
| BulkRejectDialog opened but user cancels           | State resets, no mutation fires                                                                                                                                                      |
| Network failure mid-transaction                    | `$transaction` rolls back entirely. No partial state.                                                                                                                                |
| Empty selection after page change                  | Selection is per-page (not cross-page). If user navigates away, selection resets.                                                                                                    |
| User selects "select all" then filters             | "Select all" only selects visible rows. If filter changes, selectedIds may contain IDs no longer visible. Mutation still works since IDs are validated server-side.                  |
| Rejection reason too long                          | Zod string max length (e.g., 500 chars)                                                                                                                                              |

---

## New Files

| File                                                       | Purpose                                               |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| `app/api/recruiter/applications/bulk/status/route.ts`      | POST — bulk status transition with atomic transaction |
| `app/features/recruiter/components/bulk-reject-dialog.tsx` | Dialog for bulk rejection with single reason textarea |

---

## Modified Files

| File                                                        | Change                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `components/ui/data-table.tsx`                              | Add `enableSelection`, `selectedIds`, `onSelectionChange`, `getRowId` props + checkbox column rendering |
| `app/features/recruiter/schema/application.schema.ts`       | Add `BulkStatusTransitionSchema` + type                                                                 |
| `app/features/recruiter/hooks/use-applications.ts`          | Add `useBulkTransitionStatus(jobId)` hook                                                               |
| `app/features/recruiter/components/applicants-table.tsx`    | Add selection state + bulk action bar + integrate BulkRejectDialog                                      |
| `app/features/recruiter/components/application-dialogs.tsx` | Add `BulkRejectDialog` component (or create separate file)                                              |

---

## Verification Gate

```bash
npx tsc --noEmit    # TypeScript passes (only pre-existing .next error)
npm run lint        # No new warnings from bulk action files
```

### Checklist

- [ ] All API routes use `withErrorHandler`
- [ ] `requireRole` + tenant check on every bulk route
- [ ] `$transaction` wraps all mutations (updates + status changes + notifications)
- [ ] No `any` types
- [ ] Mobile-first: bulk action bar pinned at bottom on mobile
- [ ] Selection state resets on page change
- [ ] Intersection-based action availability computed client-side
- [ ] Max 50 IDs enforced by Zod + route check
- [ ] `pendingEmail: false` in notification data for future queue
- [ ] MANIFEST.md updated after completion

---

## Open Questions (Resolved)

N/A — all design decisions made above.
