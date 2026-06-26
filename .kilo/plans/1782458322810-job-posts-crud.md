# Step 2.3: Job Posts CRUD — Implementation Plan

## Schema Change (Prisma)

Add to `model Job` in `prisma/schema.prisma`:
```prisma
status String @default("draft") // "draft" | "active" | "archived"
```
- Keep `isActive` for backward compatibility (can be derived: `isActive = status === "active"`)
- Run `npx prisma generate` to update client (migration deferred per blocker)
- Update seed script to set `status: "active"` for existing jobs

## Architecture Decisions

| Decision | Choice |
|---|---|
| Status model | `status: String` — `draft`, `active`, `archived` |
| Mutation transport | REST API routes (matches admin pattern, supports TanStack optimistic updates) |
| Tenant scoping | All queries filter by `session.companyId`; single-job ops verify `job.companyId === session.companyId` |
| Delete logic | `draft` → hard delete; `active`/`archived` → soft archive (`status="archived"`); `?force=true` enables hard delete of any job |
| Toggle transitions | `draft` → `active` (publish); `active` → `archived` (unpublish); archived re-activate via edit form only |
| Pages | Separate routes: `/recruiter/jobs`, `/recruiter/jobs/new`, `/recruiter/jobs/[id]`, `/recruiter/jobs/[id]/edit` |
| Job detail | Full job info + applicants placeholder (Step 2.4 component injected later) |
| Filters | URL-driven via `searchParams`: page, search, status, workMode, employmentType, sortBy, sortOrder |
| Form location | `features/recruiter/components/job-form.tsx` (feature-scoped, extract to shared when needed) |

## Files to Create (14)

### 1. `app/features/recruiter/schema/job.schema.ts`
Zod schemas:
- `JobCreateSchema` — all job fields except `id`, `companyId`, `recruiterId`, `viewCount`, `createdAt`, `updatedAt`, `isActive`. Validates `title` (min 1), `description` (min 1), `locations` (array of strings), `skills`, `tags`, optional fields.
- `JobUpdateSchema` — partial of create, all fields optional
- `RecruiterListJobsParamsSchema` — page, pageSize, search, status (draft/active/archived/all), workMode, employmentType, experienceLevel, sortBy, sortOrder (mirrors admin)
- `RecruiterToggleJobStatusSchema` — `{ status: z.enum(["active", "archived"]) }` for publish/unpublish
- Export `JobFormInput`, `JobListParams` inferred types

### 2. `app/features/recruiter/queries/job-queries.ts`
Server-side Prisma queries (NOT `"use server"` — plain functions):
- `listJobs(companyId: string, params: JobListParams)` — offset pagination via `parseOffsetParams`/`buildOffsetMeta`. Filters: `companyId` (required), `search` (title/description contains), `status`, `workMode`, `employmentType`, `experienceLevel`. Returns `{ jobs: JobRow[], ...OffsetPaginationMeta }`
- `getJobById(id: string, companyId: string)` — fetch single job with companyId check
- `JobRow` type: includes computed `applicationCount` (via `_count: { applications: true }`)

### 3. `app/features/recruiter/hooks/use-recruiter-jobs.ts`
TanStack Query hooks:
- `useRecruiterJobs(params: JobListParams)` — `useQuery` with key `["recruiter", "jobs", params]`, calls `GET /api/recruiter/jobs`
- `useCreateJob()` — `useMutation`, `POST /api/recruiter/jobs`, invalidates `["recruiter", "jobs"]`
- `useUpdateJob()` — `useMutation`, `PATCH /api/recruiter/jobs/[id]`, invalidates `["recruiter", "jobs"]`
- `useDeleteJob()` — `useMutation`, `DELETE /api/recruiter/jobs/[id]`, optimistic remove from cache
- `useToggleJobStatus()` — `useMutation`, `PATCH /api/recruiter/jobs/[id]/toggle`, optimistic update
- All mutations use `invalidateQueries({ queryKey: ["recruiter", "jobs"] })` on success

### 4. `app/features/recruiter/components/job-form.tsx`
`"use client"` — RHF form component:
- Props: `mode: "create" | "edit"`, `defaultValues?: Partial<JobFormInput>`, `jobId?: string`
- Fields: title, description (textarea), locations (comma-separated input → array), workMode (select), employmentType (select), timezone (input), skills (comma-separated → array), tags (comma-separated → array), experienceLevel (input), salaryMin, salaryMax, salaryCurrency (default "USD"), applicationDeadline (date input)
- On create: calls `useCreateJob().mutateAsync(data)` → redirect to `/recruiter/jobs`
- On edit: calls `useUpdateJob().mutateAsync({ id: jobId, ...data })` → redirect to `/recruiter/jobs/[id]`
- Zod resolver via `@hookform/resolvers/zod`
- Mobile-first layout: `flex-col sm:flex-row`, `w-full sm:w-auto` buttons
- All CSS tokens: `text-text-heading`, `bg-bg-surface`, `border-border-subtle`, `rounded-radius-md`, `p-spacing-4`

### 5. `app/features/recruiter/components/recruiter-jobs-table.tsx`
`"use client"` — DataTable with filters:
- Uses `useRecruiterJobs` hook
- URL-driven filter state via `useSearchParams()` + `useRouter()`
- Filters row: search input (debounced), status select (All/Draft/Active/Archived), workMode select, employmentType select
- Columns: Title (link to detail), Status (Badge: Draft=secondary, Active=default, Archived=outline), Work Mode, Employment Type, Applications count, Views, Created date
- Actions column: Edit (Pencil icon → `/recruiter/jobs/[id]/edit`), Toggle (publish/unpublish via `useToggleJobStatus`), Delete (ConfirmActionButton with context-aware label: "Delete" for drafts, "Archive" for active, "Permanently Delete" for archived → calls `useDeleteJob`)
- Pagination: Previous/Next buttons, "Page X of Y" text
- Loading: `Skeleton` rows (5 rows)
- Error: text display with retry
- Empty state: "No jobs found. Create your first job posting."

### 6. `app/features/recruiter/components/job-detail.tsx`
`"use client"` — read-only job detail view:
- Props: `jobId: string`
- Fetches job via `GET /api/recruiter/jobs/[id]`
- Displays: title, status badge, description (whitespace-pre-wrap), locations (comma-separated badges), workMode, employmentType, timezone, skills (chips), tags (chips), experienceLevel, salary range (min-max + currency), applicationDeadline, viewCount, createdAt, updatedAt
- Actions: "Edit" button → `/recruiter/jobs/[id]/edit`, "Back to Jobs" link
- Applicants section: placeholder `<div>` with "Applicants will appear here (Step 2.4)" text in `text-text-muted`
- Loading: skeleton layout
- Error: error page

### 7. `app/api/recruiter/jobs/route.ts`
REST route handler:
- `GET` — `requireRole(["recruiter"])`, validate `searchParams` via `RecruiterListJobsParamsSchema`, resolve `companyId` from session, call `listJobs(companyId, params)`, return `ok(result)`
- `POST` — `requireRole(["recruiter"])`, validate body via `JobCreateSchema`, resolve `companyId` + `recruiterId` from session, create job with default `status: "draft"`, return `ok({ job })` with status 201
- Wrapped with `withErrorHandler`

### 8. `app/api/recruiter/jobs/[id]/route.ts`
REST route handler for single job:
- `GET` — `requireRole(["recruiter"])`, fetch job by id, verify `job.companyId === session.companyId` (else `ForbiddenError`), return `ok(job)`
- `PATCH` — `requireRole(["recruiter"])`, validate body via `JobUpdateSchema`, fetch job, verify company match + job is not archived (archived jobs cannot be edited), update with `prisma.job.update`, return `ok({ job })`
- `DELETE` — `requireRole(["recruiter"])`, fetch job, verify company match, check `searchParams.force`:
  - If `status === "draft"` or `force === "true"`: `prisma.job.delete()` (hard delete)
  - Else: `prisma.job.update({ data: { status: "archived" } })` (soft delete)
  - Return `ok({ deleted: true, hardDeleted: boolean })`

### 9. `app/api/recruiter/jobs/[id]/toggle/route.ts`
REST route handler for toggle:
- `PATCH` — `requireRole(["recruiter"])`, validate body via `RecruiterToggleJobStatusSchema`, fetch job, verify company match, enforce valid transitions:
  - `status: "active"` allowed only if current is `"draft"` (publish)
  - `status: "archived"` allowed only if current is `"active"` (unpublish)
  - Else `ValidationError` with explanation
- Return `ok({ job })`

### 10. `app/(roles)/recruiter/jobs/page.tsx`
Server Component:
- `export const metadata = { title: "Jobs | HireFlow", description: "Manage your job postings" }`
- Renders `<PageHeader title="Jobs" description="Create and manage your job postings" actions={<CreateJobButton />} />`
- Renders `<Suspense fallback={...}><RecruiterJobsTable /></Suspense>`
- `CreateJobButton` = `"use client"` component with `<Button onClick={() => router.push("/recruiter/jobs/new")}>`

### 11. `app/(roles)/recruiter/jobs/new/page.tsx`
Server Component:
- `metadata = { title: "Create Job | HireFlow" }`
- Renders `<PageHeader title="Create Job" description="Fill in the details for your new job posting" />`
- Renders `<JobForm mode="create" />`

### 12. `app/(roles)/recruiter/jobs/[id]/page.tsx`
Server Component:
- `metadata = { title: "Job Details | HireFlow" }` (dynamic via `generateMetadata`)
- Reads `params.id` (Promise, await)
- Renders `<JobDetail jobId={id} />`

### 13. `app/(roles)/recruiter/jobs/[id]/edit/page.tsx`
Server Component:
- `metadata = { title: "Edit Job | HireFlow" }` (dynamic)
- Reads `params.id`, fetches job via `listJobs` or direct query to get `defaultValues`
- Renders `<PageHeader title="Edit Job" description="Update your job posting details" />`
- Renders `<JobForm mode="edit" jobId={id} defaultValues={...} />`

## Authorization Model

| Action | Guard | Additional Check |
|---|---|---|
| List jobs | `requireRole(["recruiter"])` | Filter by `companyId` |
| Create job | `requireRole(["recruiter"])` | Set `companyId` from session |
| View job detail | `requireRole(["recruiter"])` | `job.companyId === session.companyId` |
| Edit job | `requireRole(["recruiter"])` | `job.companyId === session.companyId` + job not archived |
| Delete job | `requireRole(["recruiter"])` | `job.companyId === session.companyId` |
| Toggle status | `requireRole(["recruiter"])` | `job.companyId === session.companyId` + valid transition |

## API Contract Summary

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/api/recruiter/jobs` | Query params: page, pageSize, search, status, workMode, employmentType, sortBy, sortOrder | `{ jobs: JobRow[], page, pageSize, total, totalPages, hasNextPage, hasPrevPage }` |
| `POST` | `/api/recruiter/jobs` | Body: JobCreateSchema | `{ job: Job }` (201) |
| `GET` | `/api/recruiter/jobs/[id]` | — | `{ job: Job }` |
| `PATCH` | `/api/recruiter/jobs/[id]` | Body: JobUpdateSchema (partial) | `{ job: Job }` |
| `DELETE` | `/api/recruiter/jobs/[id]` | Query: `?force=true` (optional) | `{ deleted: true, hardDeleted: boolean }` |
| `PATCH` | `/api/recruiter/jobs/[id]/toggle` | Body: `{ status: "active" | "archived" }` | `{ job: Job }` |

## Edge Cases & Error States

| Scenario | Behavior |
|---|---|
| Empty job list | "No jobs found. Create your first job posting." with create button |
| Draft job with no title | Zod validation error "Title is required" |
| Edit archived job | `ValidationError`: "Archived jobs cannot be edited. Reactivate the job first." |
| Delete archived job (no force) | Idempotent: returns `{ deleted: true, hardDeleted: false }` (already archived) |
| Delete job with applications (no force) | Soft-archives; applications preserved; UI shows "Archived successfully" toast |
| Delete job with force | Hard delete; cascade deletes applications and bookmarks; UI shows "Permanently deleted" toast |
| Toggle draft → archived | `ValidationError`: "Cannot archive a draft job. Publish it first." |
| Toggle archived → active | `ValidationError`: "Use the edit form to reactivate an archived job." |
| Cross-company access | `ForbiddenError`: "You do not have access to this job" |
| Filter by workMode "remote" + no results | Shows "No jobs match your filters. Try clearing the filters." |
| Sort by viewCount descending | Least-viewed or zero-view first when desc (handle identical values) |
| Concurrent edits | Last write wins (no optimistic locking) |
| Page param out of range | `parseOffsetParams` clamps to page 1 minimum |

## Validation Steps

1. `npx prisma generate` — generates updated Prisma client with `status` field
2. `npx tsc --noEmit` — zero new TS errors (exclude pre-existing `.next/dev/types/validator.ts`)
3. `npx eslint` on all new files — clean
4. Manual verification: create a draft job → publish → archive → verify status transitions
5. Cross-company isolation: attempt to access another company's job via URL → verify ForbiddenError

## Pre-existing Reusable Assets

- `lib/pagination.ts` — `parseOffsetParams`, `buildOffsetMeta`
- `lib/api-error.ts` — `ValidationError`, `NotFoundError`, `ForbiddenError`, `UnauthorizedError`
- `lib/api-wrapper.ts` — `withErrorHandler`
- `lib/api-response.ts` — `ok()`, `fail()`
- `components/ui/data-table.tsx` — `DataTable<T>`
- `components/ui/badge.tsx` — `Badge`
- `components/ui/button.tsx` — `Button`
- `components/layout/page-header.tsx` — `PageHeader`
- `components/shared/confirm-action-button.tsx` — `ConfirmActionButton`
- `app/features/shared/api/require-role.ts` — `requireRole()` returns `ResolvedSession`
- Admin job queries/hooks/table as reference patterns

## Dependencies

- Step 2.3 is independent — can start immediately
- Step 2.4 (Applicants View) depends on Step 2.3 (jobs must exist)
- Job Detail page has placeholder ready for Step 2.4 applicants component injection
