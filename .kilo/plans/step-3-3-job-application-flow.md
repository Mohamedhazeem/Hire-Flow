# Step 3.3 — User Job Application Flow

## Goal

User can browse public jobs, view job details, apply with a resume (and optional cover letter), track their applications, and withdraw.

## Key Design Decisions

- **Withdraw = hard DELETE** — removes the Application record, freeing the `@@unique([jobId, userId])` constraint so user can re-apply
- **Re-apply** — picks a resume from scratch (no auto-fill from previous app, which no longer exists)
- **Public jobs** at `app/jobs/` — no auth required for browsing
- **Cover letter** — optional textarea, empty string → undefined via Zod transform
- **One apply per job** — enforced by DB `@@unique([jobId, userId])` constraint + server-side check
- **Resume snapshot** — stored at apply time so future edits don't change submitted versions
- **Status transitions** logged via `ApplicationStatusChange` inside a Prisma transaction with the application creation
- **Notifications** — recruiter + company team notified on new application via `createNotification`/`triggerForCompany`

## Files (18 files, ≤150 lines each)

### Schemas (2)

1. **`app/features/jobs/schema/application-submit.schema.ts`** (~20 lines)

   ```ts
   export const ApplySchema = z.object({
     resumeId: z.string().min(1, "Resume is required"),
     coverLetter: z
       .string()
       .max(5000)
       .optional()
       .transform((v) => v?.trim() || undefined),
   });
   ```

2. **`app/features/user/schema/user-application.schema.ts`** (~25 lines)
   Zod for user-facing views. Exports the status enum + type.

### Queries (3)

3. **`app/features/jobs/queries/public-job-queries.ts`** (~80 lines)
   - `listPublicJobs(params)` — offset pagination, filter `status:"active"` + `isActive:true`, search by title, filter by workMode/employmentType/experienceLevel, sort default `createdAt DESC`
   - `getPublicJobById(id)` — fetch with company info, validate two-gate active filter

4. **`app/features/user/queries/user-application-queries.ts`** (~80 lines)
   - `listUserApplications(userId, params)` — offset pagination, filter by status, search by job title
   - `getUserApplicationDetail(id, userId)` — includes status changes timeline + resume snapshot

### API Routes (4)

5. **`app/api/jobs/route.ts`** (~45 lines) — GET paginated public job list

6. **`app/api/jobs/[id]/route.ts`** (~55 lines) — GET single job detail + company info

7. **`app/api/jobs/[id]/apply/route.ts`** (~130 lines) — POST apply
   - `requireRole(["user"])`
   - Zod validate body
   - Check job active + deadline → `ValidationError`
   - Check not already applied (`@@unique`) → `ConflictError`
   - Check resume exists, owned by user, not soft-deleted → `ForbiddenError`
   - Build snapshot (fileUrl or builderData)
   - Prisma `$transaction`: create Application + ApplicationStatusChange atomically
   - Notify recruiter via `createNotification` + `triggerForCompany`
   - `revalidatePath` for jobs and applications

8. **`app/api/user/applications/route.ts`** (~55 lines) — GET user's paginated applications
9. **`app/api/user/applications/[id]/route.ts`** (~80 lines)
   - GET — single application detail (verify `userId`)
   - DELETE — withdraw: delete only if `status IN ("applied","reviewing")` and `userId === session.id`

### Components (6)

10. **`app/features/jobs/components/job-card.tsx`** (~80 lines) — card for list
11. **`app/features/jobs/components/job-list-page.tsx`** (~130 lines) — search, filter, pagination, skeleton, empty state
12. **`app/features/jobs/components/job-detail-view.tsx`** (~140 lines) — full detail + "Apply Now" / already-applied badge
13. **`app/features/jobs/components/apply-modal.tsx`** (~140 lines) — resume selector, cover letter, submit, success/error states
14. **`app/features/user/components/applications-page.tsx`** (~140 lines) — paginated table with status badges, empty state
15. **`app/features/user/components/application-detail-view.tsx`** (~150 lines) — status timeline, resume snapshot, job info, withdraw button

### Hooks (1)

16. **`app/features/jobs/hooks/use-apply-job.ts`** (~25 lines) — TanStack Query `useMutation`, invalidates queries on success

### Pages (4 — thin orchestrators)

17-20. `app/jobs/page.tsx`, `app/jobs/[id]/page.tsx`, `app/(roles)/user/applications/page.tsx`, `app/(roles)/user/applications/[id]/page.tsx` — each ≤15 lines, imports and renders the corresponding client component.

### Schema Alignment (1)

21. **`app/features/recruiter/schema/application.schema.ts`** — add `"withdrawn"` to `APPLICATION_STATUSES` (documentation/convention — withdraw hard-deletes, so this status never exists in DB)

## Edge Cases (36)

| #   | Edge Case                                        | Handling                                                                         |
| --- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| 1   | No resumes to apply with                         | Modal shows "Create a resume first" link, submit disabled                        |
| 2   | Apply to inactive/deleted job                    | Server checks `status:"active"` + `isActive:true` → `ValidationError`            |
| 3   | Apply after deadline                             | Route checks `applicationDeadline` → `ValidationError`                           |
| 4   | Apply twice to same job                          | `@@unique` → P2002 → `ConflictError("You have already applied")`                 |
| 5   | Apply with someone else's resume                 | Fetch resume checks `userId` + `deletedAt: null` → `ForbiddenError`              |
| 6   | Resume deleted after apply                       | Snapshot stored at apply time — future edits don't matter                        |
| 7   | File-uploaded resume apply                       | `resumeSnapshotUrl` stores the file URL                                          |
| 8   | Builder resume apply                             | `resumeSnapshotBuilderData` stores the builderData JSON                          |
| 9   | Cover letter empty or whitespace                 | Zod `.transform(v => v?.trim() \|\| undefined)` → stored as undefined            |
| 10  | Withdraw when already hired/rejected             | Server check: only `"applied"` or `"reviewing"` → `ValidationError`              |
| 11  | Withdraw is hard-delete                          | Application record removed. `@@unique` freed — user can re-apply                 |
| 12  | Withdraw on already-deleted app                  | Prisma `delete` throws P2025 → caught → `NotFoundError`                          |
| 13  | View application for deleted job                 | Show "Job no longer available" banner, display resume snapshot + timeline        |
| 14  | Empty applications list                          | "No applications yet. Browse jobs" CTA → link to `/jobs`                         |
| 15  | Empty job search results                         | "No jobs found matching your criteria" with "Clear filters" button               |
| 16  | Page beyond total results                        | Pagination hides next button, shows "Page X of Y"                                |
| 17  | Unauthenticated user on public jobs              | `app/jobs/` is outside `(roles)` — no auth check, no session access              |
| 18  | Unauthenticated user clicks Apply                | API route returns 401 via `requireRole`                                          |
| 19  | Apply modal backdrop click                       | Closes modal. In-flight mutation cancelled by TanStack Query on unmount          |
| 20  | Double-click submit                              | Button `disabled` during `isPending`                                             |
| 21  | Cover letter exactly 5000 chars                  | Zod `.max(5000)` allows boundary                                                 |
| 22  | Job with no company info                         | `companyName` defaults to "Unknown" in query                                     |
| 23  | Salary range null                                | Don't show salary section                                                        |
| 24  | Public job list sort/order                       | Default: `createdAt DESC`. Params override                                       |
| 25  | Mobile job card                                  | Single column, truncated text, horizontal scroll for skills                      |
| 26  | Mobile apply modal                               | Full-screen on mobile (`max-sm:inset-0`), scrollable                             |
| 27  | Status timeline empty (race condition)           | Detail view injects a synthetic "Applied" entry as fallback                      |
| 28  | Resume snapshot missing both URL and builderData | Show "Resume data not available"                                                 |
| 29  | Apply to expired deadline (timezone edge)        | Compare against `new Date()` UTC. Deadline stored as DateTime (UTC)              |
| 30  | Multiple rapid submits from network replay       | `@@unique` constraint in DB is the final guard                                   |
| 31  | Invalid sort params in URL                       | Zod defaults on `safeParse`: `sortBy: "createdAt"`, `sortOrder: "desc"`          |
| 32  | Empty DB on browse                               | `<JobListPage>` shows "No jobs found" with CTA                                   |
| 33  | Cover letter empty string                        | Zod `transform` converts to undefined                                            |
| 34  | Application created but status log fails         | Prisma `$transaction` wraps both creates atomically                              |
| 35  | User applies with stale resume data in modal     | Resume list fetched fresh on mount via `useQuery`. Stale data rejected by server |
| 36  | View another user's application by URL           | Server checks `userId === session.id` → 404                                      |

## Implementation Order

1. Add `"withdrawn"` to `APPLICATION_STATUSES` in `app/features/recruiter/schema/application.schema.ts`
2. Create schemas (#1-2)
3. Create queries (#3-4)
4. Create API routes (#5-9)
5. Create components (#10-15)
6. Create hook (#16)
7. Create pages (#17-20)
8. `npx tsc --noEmit` — fix any errors
9. Manual verification against the 36 edge cases above

## Validation

- `npx tsc --noEmit` — zero errors
- Browse `/jobs` → paginated list with company info
- Filter by workMode → URL updates, list re-fetches
- View `/jobs/[id]` → full detail with apply button
- Apply with valid resume → application created, notification sent
- Apply again to same job → 409 error
- Visit `/user/applications` → application visible with "Applied" badge
- Open detail → status timeline with "Applied" entry
- Withdraw → record deleted → reappears in job list as available to apply
- Re-apply → second application created successfully
- Mobile responsive on all pages
- All 18 files ≤150 lines
