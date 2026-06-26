# Step 2.6 — Applicant Detail View

## Goal

Build a production-grade applicant detail page for recruiters that consolidates the applicant's user profile (credentials, skills, experience), resume (file viewer/download), application status timeline (chronological milestones), recent message preview, and in-page status transition controls — all in one mobile-friendly page.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Route** | `/recruiter/applicants/[applicationId]` | Flat, shareable URL. Back button returns to whichever job's applicants table the recruiter came from. |
| **Status history model** | New `ApplicationStatusChange` Prisma model | Immutable audit trail with `fromStatus`, `toStatus`, `changedById`, `createdAt`. Notifications store this as opaque JSON; a dedicated model is queryable, indexable, and reliable. |
| **File proxy** | `/api/files/download?path=...` | Auth-guarded before serving from `/public/uploads/`. Validates session + tenant clearance. Easy to swap for signed S3 URLs later. |
| **Timeline rendering** | New `StatusTimeline` shared component | Ordered vertical timeline with icon-per-status, date labels, and change author. Reusable across admin/recruiter roles. |
| **Route format** | Hybrid: table at `/recruiter/jobs/[jobId]/applicants`, detail at `/recruiter/applicants/[applicationId]` | Clean URLs, shareable, independent of which job the recruiter navigated from. |

---

## Prisma Changes

### New Model

Add to `prisma/schema.prisma`:

```prisma
model ApplicationStatusChange {
  id             String      @id @default(cuid())
  applicationId  String
  application    Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  fromStatus     String
  toStatus       String
  changedById    String
  changedBy      User        @relation(fields: [changedById], references: [id])
  note           String?
  createdAt      DateTime    @default(now())

  @@index([applicationId, createdAt])
  @@map("application_status_change")
}
```

### Existing Route Modification

**`app/api/recruiter/applications/[applicationId]/status/route.ts`** — Insert an `ApplicationStatusChange` record after the successful `updateMany` and before the notification creation. Use the recruiter's session ID as `changedById`, the previous status as `fromStatus`, the new status as `toStatus`, and include `recruiterNote` if present.

### Migration

```bash
npx prisma migrate dev --name add_application_status_change
```

### Backfill Script

Create `prisma/scripts/backfill-status-changes.ts` (one-time, not part of normal startup):

1. For each `Application` that has zero `ApplicationStatusChange` records:
   - Create initial record: `fromStatus: "applied"`, `toStatus: <first known>`, `changedById: <applicantId>`, `createdAt: appliedAt`
   - Query `Notification` where `type: "application_status"` and `data->applicationId` matches. For each, parse `previousStatus`, `newStatus`, `updatedBy` from the JSON `data` field and create a record.
   - If notification trail doesn't cover the current status, create a final record.
2. Run via: `npx tsx prisma/scripts/backfill-status-changes.ts`

---

## New Files

### API Route: `app/api/recruiter/applications/[applicationId]/detail/route.ts`

`GET` — Unified server-side data call returning:
- Application record (with tenant check: `job.companyId === session.companyId`)
- User profile (name, email, role, headline, skills, experiences, location, basePay, ctc, socialLinks)
- Resumes (all, with `isPrimary` flag)
- Job info (id, title)
- Status timeline (ordered asc by createdAt)
- Recent messages (last 5, ordered desc by createdAt, from threadId)

Response shape:
```ts
{
  application: { id, status, appliedAt, updatedAt, rejectionReason, recruiterNote, interviewDate, meetingLink, offerDetails, job: { id, title } },
  applicant: { id, name, email, role, profile: { headline, bio, skills, experiences, location, basePay, ctc, socialLinks, resumes: [...] } | null },
  statusTimeline: { id, fromStatus, toStatus, changedByName, createdAt, note }[],
  recentMessages: { id, content, fileUrl, senderId, createdAt }[]
}
```

### API Route: `app/api/files/download/route.ts`

`GET` — Auth-guarded file proxy:

```ts
async function handleGET(request: NextRequest) {
  const session = await requireRole(["admin", "super_admin", "recruiter"]);
  const path = request.nextUrl.searchParams.get("path");
  if (!path) throw new ValidationError("Missing 'path' param");
  // Security: resolve and verify it stays within /public/uploads/
  const resolved = path.resolve(UPLOAD_DIR, path.replace("/uploads/", ""));
  if (!resolved.startsWith(UPLOAD_DIR)) throw new ForbiddenError("Invalid path");
  // Read file, return with correct Content-Type
  const buffer = await readFile(resolved);
  return new NextResponse(buffer, { headers: { "Content-Type": mimeType, "Content-Disposition": "inline" } });
}
```

Edge cases:
- Path traversal attempts → `ForbiddenError`
- File not found → `NotFoundError`
- File >10MB → `413 Payload Too Large`
- Unauthenticated → `UnauthorizedError`

### Server Query: `app/features/recruiter/libs/get-applicant-detail.ts`

Server-side function that assembles the unified response. Called by the detail API route. Single Prisma transaction for consistency.

### Hook: `app/features/recruiter/hooks/use-applicant-detail.ts`

```ts
export function useApplicantDetail(applicationId: string) {
  return useQuery<ApiResponse<ApplicantDetailResponse>>({
    queryKey: ["recruiter", "applicant-detail", applicationId],
    queryFn: () => apiClient(`/api/recruiter/applications/${applicationId}/detail`),
    enabled: !!applicationId,
  });
}
```

### Shared Component: `components/shared/status-timeline.tsx`

```tsx
type StatusChange = {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedByName: string;
  createdAt: string;
  note?: string;
};

type Props = {
  changes: StatusChange[];
};
```

Renders a vertical timeline with:
- Icon per status (maps status → icon: `applied→SendIcon`, `reviewing→SearchIcon`, `shortlisted→CheckCircle2Icon`, `interview_scheduled→CalendarIcon`, `offered→SendIcon`, `hired→BriefcaseIcon`, `rejected→XCircleIcon`)
- Status label + relative time ("2 days ago")
- "by [name]" subtitle
- Note/reason text if present
- Mobile: compact dots with expandable details
- Desktop: full row layout
- Also includes an initial "Application Submitted" milestone from `appliedAt` (not a status change, but first entry)

### Page Component: `app/features/recruiter/components/applicant-detail-page.tsx`

"use client" — main page component with sections:

```
┌──────────────────────────────────────────────────┐
│  ← Back to Applicants   [Job Title badge]        │
│  Applicant Name · email                           │
│  Current Status: [StatusBadge]                    │
├──────────────────────────────────────────────────┤
│ ┌────────────────────┐ ┌────────────────────────┐│
│ │   PROFILE SECTION   │ │   TIMELINE SECTION     ││
│ │  Headline           │ │  ● Applied (submitted) ││
│ │  Skills chips       │ │  ● Reviewing           ││
│ │  Experience list    │ │  ● Shortlisted         ││
│ │  Location, Pay      │ │  ● Interview Scheduled ││
│ │  Social links       │ │  ● Offered             ││
│ │                     │ │                        ││
│ │  [Download Resume]  │ └────────────────────────┘│
│ └────────────────────┘ ┌────────────────────────┐│
│                        │   RECENT MESSAGES       ││
│                        │  msg preview 1 ...      ││
│                        │  msg preview 2 ...      ││
│                        │  [View All → Messages]  ││
│                        └────────────────────────┘│
│ ┌────────────────────────────────────────────────┐│
│ │   STATUS ACTIONS   (depends on current status) ││
│ │  [Start Review] [Shortlist] [Schedule Interview]││
│ │  [Send Offer] [Reject]                         ││
│ └────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

- **Mobile**: Single-column stacked layout. Timeline collapses to vertical dots with expandable details.
- **Desktop**: Two-column grid (Profile left, Timeline right). Messages full-width below. Status actions bar pinned at bottom on scroll.

### Skeleton: `app/features/recruiter/components/applicant-detail-skeleton.tsx`

Loading skeleton matching the detail page layout (profile skeleton card, timeline skeleton lines, messages skeleton rows).

### Page Route: `app/(roles)/recruiter/applicants/[applicationId]/page.tsx`

Server Component:
```tsx
export default async function ApplicantDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  return (
    <Suspense fallback={<ApplicantDetailSkeleton />}>
      <ApplicantDetailPageClient applicationId={applicationId} />
    </Suspense>
  );
}
```

---

## Modified Files

### `prisma/schema.prisma`

- Add `ApplicationStatusChange` model as specified above.

### `app/api/recruiter/applications/[applicationId]/status/route.ts`

- After successful `updateMany` and before `prisma.notification.create`, add:
  ```ts
  await prisma.applicationStatusChange.create({
    data: {
      applicationId,
      fromStatus: application.status,
      toStatus: status,
      changedById: session.id,
      note: parsed.data.recruiterNote ?? null,
    },
  });
  ```

### `app/features/recruiter/components/applicants-table.tsx`

- Add `EyeIcon` button to the actions column that navigates to `/recruiter/applicants/${row.id}`:
  ```tsx
  <Button variant="ghost" size="icon-sm" title="View Details"
    onClick={() => router.push(`/recruiter/applicants/${row.id}`)}>
    <EyeIcon className="size-4 text-text-muted hover:text-brand" />
  </Button>
  ```
- Place it before the Message button and after the status action buttons.

### `app/features/recruiter/components/job-detail.tsx`

- Update the applicants placeholder section (line 221-224) to remove the "Applicants will appear here" text now that the detail view exists. Embed a link/reference to the applicants table.

---

## Edge Cases

| Case | Handling |
|---|---|
| No profile found | Show "No profile provided" placeholder section. Do not error. |
| No resume uploaded | "Resume not uploaded" with no download button. |
| No status changes yet | Timeline shows single "Application Submitted" milestone. |
| No messages yet | "No messages yet" section with "Start Conversation" button linking to `/recruiter/messages?thread={threadId}` |
| Deleted applicant user | `NotFoundError` — application exists but user is deleted. Graceful error page. |
| Concurrent timeline updates | `ApplicationStatusChange` is append-only — no conflict. Status PATCH uses optimistic locking via `updatedAt`. |
| Recruiter tries to view non-company applicant | `NotFoundError` — tenant check on `job.companyId` fails. |
| Large resume file (>10MB) | File proxy returns `413 Payload Too Large` with message. |
| Path traversal in file proxy | Path normalization + prefix check → `ForbiddenError`. |
| File not found on disk | `NotFoundError` with "File not found or has been removed." |
| ApplicationStatusChange record insertion fails | Status PATCH rolls back — `updateMany` and status change creation are in a transaction. |
| Future-dated interview | Timeline shows "(upcoming)" badge on the interview milestone. |

---

## Verification Gate

```bash
npx tsc --noEmit    # TypeScript passes
npm run lint        # No new warnings
```

### Checklist

- [ ] All API routes use `withErrorHandler`
- [ ] All DB writes use `requireRole` + tenant check on `companyId`
- [ ] No `any` types — use `z.infer` + `import type`
- [ ] Mobile-first responsive layout (single column → two column at `md:`)
- [ ] File proxy URL format consistent with how messages store `fileUrl`
- [ ] Backfill script idempotent (safe to run multiple times)
- [ ] `ApplicationStatusChange` records created on every status transition
- [ ] PRISMA migration runs successfully
- [ ] MANIFEST.md updated after completion
