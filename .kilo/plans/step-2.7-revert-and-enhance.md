# Step 2.7+ — One-Time Bulk Actions, Revert, Visual Feedback, Filter Tags

## Goal

Enforce one-time bulk action constraint (same applicant cannot be re-selected for bulk action after being bulk-actioned), add revert capability for accidental rejections/status changes, color-coded status filter tags, and visual success/error feedback.

---

## Requirements

### 1. One-Time Bulk Action Constraint (per session)

- After a bulk action completes, those applicant IDs are tracked in a `actionedIds` Set.
- Actioned rows are **visually dimmed** and their **checkbox is disabled** (not hidden).
- The recruiter **cannot** select them again until they manually **revert** the action.
- The revert removes the ID from `actionedIds`, re-enabling selection.

### 2. Revert Mechanism (per-row)

- Each row that was bulk-actioned shows a **Revert icon button** (Undo2 icon) in the actions column.
- Clicking revert opens a **RevertConfirmDialog** ("Revert [Name] to [previousStatus]?").
- On confirm, `PATCH /api/recruiter/applications/[id]/revert` reverses to the **previous status** (from the most recent `ApplicationStatusChange` record).
- The revert API:
  - Fetches the latest `ApplicationStatusChange` for that application (the one the recruiter just made).
  - Reads `fromStatus` from that record.
  - Updates the application status back to `fromStatus`.
  - Creates a **new** `ApplicationStatusChange` (fromStatus=current, toStatus=revertedTo) as an audit record.
  - Clears the `rejectionReason` if reverting a rejection (or other state-specific fields).
  - Returns the reverted status.
- After successful revert, the applicant's status badge updates (via query invalidation), and the row becomes selectable again.

### 3. Color-Coded Status Filter Tags

- The existing `StatusBadge` component already maps each status to a color:
  - `applied`: brand (blue/purple)
  - `reviewing`: info (cyan-ish)
  - `shortlisted`: accent (green/teal)
  - `interview_scheduled`: warning (amber)
  - `offered`: success (green)
  - `hired`: success-bold (darker green)
  - `rejected`: error (red)
- The **status filter dropdown** currently shows plain text. Update it to show **inline colored dots or mini badges** next to each status option.
- The **table status column** already uses `StatusBadge` which colors based on status → no change needed there.

### 4. Visual Feedback on Bulk Actions

- On **success**: Show a transient banner below the bulk action bar:
  > ✓ 5 applicants moved to "Shortlisted"
- On **error**: Show a transient banner below the bulk action bar:
  > ✕ Failed: [error message from API]
- Banner auto-dismisses after 5 seconds, or user can click X to dismiss.
- Banner uses success/error color theming.

### 5. One-Time Constraint on Single (Inline) Actions Too

- The inline action buttons (Shortlist, Schedule Interview, Reject, etc.) on each row already fire status transitions.
- **Question for user:** Should these inline single actions also be constrained to one-time (i.e., after clicking "Shortlist" on a row, the button disappears because the status changed)? The current behavior: the buttons are status-conditional and disappear naturally when the status changes (because they check `row.status === "reviewing"` etc.).
- **Assumption:** The inline action buttons are already one-time because they are gated on the current status. Once the status changes, the button condition no longer matches and it disappears. No extra work needed for single actions.

---

## Detailed File Changes

### Modified Files

#### `components/ui/data-table.tsx`

Extend `DataTableProps` with:

```ts
disabledIds?: Set<string>;
```

Changes in `TableRow` for disabled rows:

```tsx
const isDisabled = disabledIds?.has(rowId);
// ...
className={cn(
  "border-b ...",
  isSelected && "bg-brand/[0.04]",
  isDisabled && "opacity-50",
  !isSelected && !isDisabled && "hover:bg-brand/[0.02]",
)}

// Row click handler: if (isDisabled) return;  (only blocks row-click-to-select)
// DO NOT apply pointer-events-none to the row — revert button in actions column must stay clickable
```

- **Row appearance:** `opacity-50` only (visual dimming). No `pointer-events-none` / `cursor-not-allowed` on the row.
- **Checkbox:** `disabled={isDisabled}` — prevents selecting via checkbox.
- **Row click:** `if (isDisabled) return;` — prevents selecting via row click.
- **Actions column cells:** NOT disabled — revert button remains fully clickable.

The "Select all" header checkbox: when disabled rows exist, "Select all" should only select enabled rows.

#### `app/features/recruiter/components/applicants-table.tsx`

**New state:**

```ts
const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
  null,
);
```

**New derived data:**

```ts
const actionedRows = useMemo(
  () => applicants.filter((a) => actionedIds.has(a.id)),
  [applicants, actionedIds],
);
```

**Updated `handleBulkAction` onSuccess:**

```ts
onSuccess: (data) => {
  setFeedback({ type: "success", message: `${ids.length} applicants moved to "${BULK_ACTION_LABELS[targetStatus] ?? targetStatus}"` });
  setActionedIds(prev => { const n = new Set(prev); for (const id of selectedIds) n.add(id); return n; });
  setSelectedIds(new Set());
  if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 5000);
},
onError: (error: Error) => {
  setFeedback({ type: "error", message: (error as { message?: string }).message ?? "Bulk action failed" });
  if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 5000);
},
```

**Revert handler:**

```ts
const handleRevert = useCallback(
  (applicationId: string) => {
    revertTransition.mutate(
      { applicationId },
      {
        onSuccess: () => {
          setActionedIds((prev) => {
            const n = new Set(prev);
            n.delete(applicationId);
            return n;
          });
        },
      },
    );
  },
  [revertTransition],
);
```

**Actions column per-row:**
If `actionedIds.has(row.id)`, show a **Revert** icon button (Undo2 from lucide-react) instead of the normal action buttons.

**Bulk action bar:**

- Add `disabledIds={actionedIds}` to `<DataTable>`
- Add feedback banner below data table, above bulk bar

**RevertConfirmDialog:**

- Simple dialog: "Revert [Name] back to [previousStatus]? This will undo the last status change."

#### `app/features/recruiter/hooks/use-applications.ts`

Add `useRevertStatus` mutation:

```ts
export function useRevertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId }: { applicationId: string }) =>
      apiClient(`/api/recruiter/applications/${applicationId}/revert`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applicants"] });
    },
  });
}
```

#### `app/api/recruiter/applications/[applicationId]/revert/route.ts` (NEW)

```ts
// POST /api/recruiter/applications/[applicationId]/revert
async function handlePOST(request, { params }) {
  const session = await requireRole(["recruiter"]);
  const { applicationId } = await params;

  // 1. Fetch application (tenant-checked)
  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId: session.companyId } },
    select: { id: true, userId: true, jobId: true, status: true },
  });
  if (!application) throw new NotFoundError("Application not found");

  // 2. Find the most recent status change BY THIS RECRUITER for this application
  const lastChange = await prisma.applicationStatusChange.findFirst({
    where: { applicationId, changedById: session.id },
    orderBy: { createdAt: "desc" },
  });
  if (!lastChange) throw new ValidationError("No previous status change to revert");

  const revertToStatus = lastChange.fromStatus;

  // 3. In a transaction: update application + create audit record
  await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = { status: revertToStatus };
    // Clear rejection reason if reverting a rejection
    if (revertToStatus !== "rejected") {
      updateData.rejectionReason = null;
    }

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

  return ok({ status: revertToStatus });
}
```

#### `app/features/recruiter/components/revert-dialog.tsx` (NEW)

Simple confirmation dialog:

```tsx
type RevertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: ApplicantRow | null;
  onConfirm: () => void;
  isPending: boolean;
};
```

#### `app/features/recruiter/schema/application.schema.ts`

Add `REVERT_TRANSITIONS` map — unused by the route (route reads from `ApplicationStatusChange`), but available for client-side validation if needed.

Actually, the revert route uses the `fromStatus` from the audit trail, so no schema changes needed for the revert logic.

#### `app/(roles)/recruiter/jobs/[jobId]/applicants/page.tsx` — Status filter tag colors

Replace the existing `<SelectItem>` inside `<SelectContent>` with styled versions that include a colored dot:

```tsx
{
  STATUS_OPTIONS.map((opt) => (
    <SelectItem key={opt.value} value={opt.value}>
      <span className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", STATUS_DOT_COLORS[opt.value] ?? "bg-muted")} />
        {opt.label}
      </span>
    </SelectItem>
  ));
}
```

Actually, the filter is inside `applicants-table.tsx`, not the page. The Select dropdown there needs updating.

Add a `STATUS_DOT_COLORS` map:

```ts
const STATUS_DOT_COLORS: Record<string, string> = {
  all: "bg-muted",
  applied: "bg-brand",
  reviewing: "bg-info",
  shortlisted: "bg-accent",
  interview_scheduled: "bg-warning",
  offered: "bg-success",
  hired: "bg-success-dark",
  rejected: "bg-error",
};
```

---

## New Files

| File                                                             | Purpose                                      |
| ---------------------------------------------------------------- | -------------------------------------------- |
| `app/api/recruiter/applications/[applicationId]/revert/route.ts` | POST — revert application to previous status |
| `app/features/recruiter/components/revert-dialog.tsx`            | Confirmation dialog for revert action        |

## Modified Files

| File                                                     | Change                                                                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `components/ui/data-table.tsx`                           | Add `disabledIds` prop, disable checkbox + dim styling for disabled rows                                                            |
| `app/features/recruiter/hooks/use-applications.ts`       | Add `useRevertStatus()` mutation                                                                                                    |
| `app/features/recruiter/components/applicants-table.tsx` | `actionedIds` state, feedback banner, revert handler, revert button in actions column, disabledIds passthrough, colored filter dots |

---

## Behavior Summary

- **Select → Bulk Action** → IDs move to `actionedIds` → rows become dimmed (`opacity-50`), checkbox disabled, row-click-to-select blocked → Revert button appears in actions column (fully clickable).
- **Revert** → removes ID from `actionedIds` → row becomes selectable again.
- **Page change / filter** → `actionedIds` persists in memory. Rows from other pages that match `actionedIds` (if they appear) will be dimmed. After table refetch (invalidation), rows with a new status from the server will likely not appear under the same filter, so they won't clash.
- **Feedback banner** → auto-dismiss 5s, user can X out. Only one banner at a time.
- **Filter dropdown** → each status option shows a colored dot matching the status badge color.

---

## Verification Gate

```bash
npx tsc --noEmit    # TypeScript passes (only pre-existing .next error)
npm run lint        # No new errors on modified files
```
