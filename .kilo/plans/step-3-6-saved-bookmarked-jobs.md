# Step 3.6 — Saved / Bookmarked Jobs

## Goal

Build a bookmark/save-jobs feature: users can bookmark jobs from the public job listing (`/jobs`) and job detail page (`/jobs/[id]`), view them on a dedicated page (`/user/saved-jobs`), and toggle via a bookmark icon.

## Context

- `Bookmark` model already exists in `prisma/schema.prisma` (id, userId, jobId, createdAt, `@@unique([userId, jobId])`). **Zero code references it** — this is greenfield.
- `PublicJobRow` type exists with full job + company data. The saved-jobs page will augment it with bookmark metadata.
- `JobCard` (141 lines) is a `<button>` wrapping all content — bookmark icon inside must use `e.stopPropagation()`.
- `JobDetailView` (231 lines) renders job details + "Apply Now" button.
- `useSession` from better-auth is available on public pages.
- Default `queryFn` in `lib/query-client.ts` already redirects to `/login` on `UnauthorizedError`.

## Files to Create

### 1. `app/api/user/bookmarks/route.ts` (~30 lines)

- `GET` — `requireRole(["user"])`. Fetch all bookmarks for current user, return `{ jobIds: string[] }`. Query includes `Bookmark.job` + `job.company` for the saved-jobs page.
- `POST` — `requireRole(["user"])`. Accept `{ jobId }` in body. Toggle: find existing bookmark by `@@unique([userId, jobId])`; if exists → delete, if not → create. Return `{ bookmarked: boolean, id?: string }`.

### 2. `app/api/user/bookmarks/[jobId]/route.ts` (~20 lines)

- `GET` — `requireRole(["user"])`. Check if bookmark exists for this user+job. Return `{ bookmarked: boolean }`. Used by the job detail page.

### 3. `app/features/user/hooks/use-saved-jobs.ts` (~40 lines)

- `useBookmarkedIds()` — `useQuery({ queryKey: ["user", "bookmarks", "ids"], queryFn: async () => ... })`. Returns `string[]` of job IDs. Used by `SaveJobButton` to check per-card status via `.includes()`.
- `useBookmarkedJobs()` — `useQuery({ queryKey: ["user", "bookmarks", "jobs"], queryFn: async () => ... })`. Returns full job + company data for the saved-jobs page.
- `useToggleBookmark()` — `useMutation({ mutationFn: ... })`. Calls `POST /api/user/bookmarks` with `{ jobId }`. On success, invalidates `["user", "bookmarks", "ids"]` and `["user", "bookmarks", "jobs"]` query keys.

### 4. `app/features/user/components/save-job-button.tsx` (~45 lines)

- Props: `{ jobId: string; size?: "sm" | "md" }`
- Uses `useSession()` to check auth. If no session, renders a button that navigates to `/login?returnUrl=...`
- Uses `useBookmarkedIds()` to check if `jobId` is in the list
- Uses `useToggleBookmark()` for the toggle action
- Icon: `<BookmarkIcon />` from `lucide-react` (filled when bookmarked, outline when not)
- `e.stopPropagation()` on click to prevent card navigation
- Disabled during mutation (loading state)
- Accessible: `aria-label="Save job"` / `"Remove saved job"`
- Mobile: touch target ≥36px via padding on icon button

### 5. `app/features/user/components/saved-jobs-page.tsx` (~120 lines)

- "use client"
- Fetches bookmarked jobs via `useBookmarkedJobs()`
- Renders same grid layout as `JobListPage` (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`)
- Uses existing `JobCard` for each job (passes same props `JobCard` expects)
- Loading: skeleton grid (6 skeleton cards)
- Empty: "No saved jobs yet" + "Browse Jobs" link to `/jobs`
- Error: "Failed to load saved jobs" + retry button
- Page wrapper: reusable `PageHeader` with title "Saved Jobs" + `BookmarkIcon`

### 6. `app/(roles)/user/saved-jobs/page.tsx` (~8 lines)

- Thin server component that renders `<SavedJobsPage />`

## Files to Modify

### 7. `app/features/user/components/user-sidebar.tsx` (+2 lines)

- Add `BookmarkIcon` import from `lucide-react`
- Add `{ href: "/user/saved-jobs", label: "Saved Jobs", icon: BookmarkIcon }` to `userLinks` array (between Applications and Messages)

### 8. `app/features/jobs/components/job-card.tsx` (~+8 lines)

- Export `JobCardProps` type (needed for `saved-jobs-page.tsx`)
- Add `SaveJobButton` in the top-right corner of the card, inside the `flex items-start gap-4 min-w-0` row, after the text section. The button should be `size-8` with `shrink-0` to not compress the title area.
- Add `import { SaveJobButton } from "@/app/features/user/components/save-job-button"`
- `SaveJobButton` uses `jobId` from props

### 9. `app/features/jobs/components/job-detail-view.tsx` (~+6 lines)

- Add `SaveJobButton` in the header area, near the "Apply Now" button row
- Add `import { SaveJobButton } from "@/app/features/user/components/save-job-button"`
- Place before the "Apply Now" button

## Complete Edge Case Checklist

| #    | Edge Case                                                | Expected Behavior                                                                                                                              |
| ---- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| EC1  | Unauthenticated user clicks bookmark                     | `useSession()` returns null → button navigates to `/login?returnUrl=/jobs/{jobId}` or `/jobs` (current page)                                   |
| EC2  | Fast double-click on bookmark                            | TanStack `isPending` disables button on first click; second click does nothing                                                                 |
| EC3  | Same job bookmarked in two browser tabs                  | Each toggle hits the server; server checks `findUnique` → create/delete. Second tab refetches on focus and syncs                               |
| EC4  | Bookmark a job, then the job gets deleted                | Cascade delete (`onDelete: Cascade` on `Bookmark.job` FK) removes bookmark row. Saved-jobs page excludes jobs where `job` is null (inner join) |
| EC5  | User deletes their account                               | All bookmarks cascade-deleted (`onDelete: Cascade` on `Bookmark.user` FK)                                                                      |
| EC6  | 0 saved jobs                                             | Saved-jobs page shows empty state: "No saved jobs yet" + `BookmarkIcon` + "Browse Jobs" link to `/jobs`                                        |
| EC7  | Bookmark limit                                           | No limit. `@@unique([userId, jobId])` prevents duplicates naturally                                                                            |
| EC8  | Bookmark icon on job card while list is paginated        | `SaveJobButton` uses the shared `useBookmarkedIds()` cache key — doesn't re-fetch per-card. Same query powers all cards                        |
| EC9  | Bookmark toggle on job detail page                       | `SaveJobButton` also works in the detail view. Uses same cache as cards                                                                        |
| EC10 | Loading state on bookmark toggle                         | Button shows `Loader2Icon` spinner and is disabled                                                                                             |
| EC11 | Error state on bookmark toggle                           | Toast/console.error but button re-enabled. No blocking                                                                                         |
| EC12 | Network error during initial `useBookmarkedIds()` fetch  | Defaults to `[]` — bookmark icon shows as "not bookmarked" (outline). User can click to save (will succeed on next request)                    |
| EC13 | Mobile touch target                                      | `SaveJobButton` has `className` with padding that makes effective touch area ≥36px; icon itself is `size-4` (card) or `size-5` (detail)        |
| EC14 | Bookmark icon click vs card navigation                   | `e.stopPropagation()` + `e.preventDefault()` on button click inside card                                                                       |
| EC15 | Saved-jobs page pagination                               | Same pagination params as public job list; default 20 per page                                                                                 |
| EC16 | Bookmark icon on expired jobs                            | Works the same — user may want to trigger-apply later or just remember a job                                                                   |
| EC17 | Sidebar active state                                     | `/user/saved-jobs` highlighted when on that page (existing `usePathname`-based active detection in `Sidebar`)                                  |
| EC18 | `POST /api/user/bookmarks` body validation               | Zod schema: `{ jobId: z.string().min(1) }` — throws `ValidationError` on malformed                                                             |
| EC19 | `POST /api/user/bookmarks` with non-existent jobId       | `prisma.bookmark.create` throws on FK constraint → `withErrorHandler` returns 500 (acceptable, edge case of invalid client)                    |
| EC20 | Concurrent bookmark + unbookmark from different sessions | Last-write-wins. `findUnique` + conditional create/delete is not atomic; edge case with negligible impact for this use case                    |

## Data Flow

```
JobCard / JobDetailView
  └─ SaveJobButton({ jobId })
       ├─ useSession() → check auth
       ├─ useBookmarkedIds() → check if jobId in cached list
       └─ useToggleBookmark() → POST /api/user/bookmarks
            ├─ onSuccess → invalidate ["user", "bookmarks", "ids"]
            └─ onError → show error, revert optimistic state

SavedJobsPage
  └─ useBookmarkedJobs() → GET /api/user/bookmarks (with job data)
       └─ renders JobCard grid

UserSidebar
  └─ "Saved Jobs" link at /user/saved-jobs
```

## Verification

1. `npx tsc --noEmit` — zero errors
2. `npm run lint` — zero new errors/warnings
3. All components ≤150 lines (verify with `Measure-Object -Line`)
4. Manual E2E:
   - Visit `/jobs` as unauthenticated → click bookmark icon → redirected to `/login?returnUrl=...`
   - Log in → visit `/jobs` → click bookmark icon on card → icon fills → click again → icon outlines
   - Visit `/jobs/[id]` → bookmark icon present and working
   - Visit `/user/saved-jobs` → shows bookmarked jobs as cards → empty state when none
   - Click bookmark on a job card navigated away from → back to `/user/saved-jobs` → job appears
   - Sidebar shows "Saved Jobs" link; active state works
   - Refresh page → bookmark state persists
   - Mobile: card layout still works; icon touch area adequate
