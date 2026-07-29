# Step 3.4 — User Activity Panel

## Architecture Decision

**No user dashboard exists** (confirmed: no dashboard queries, no dashboard components). The placeholder `/user/page.tsx` (just "CANDIDATEDASHBOARD" text) is replaced by the Activity Panel.

## Route Map

| Route                     | Component                                                             | Sidebar Link                      |
| ------------------------- | --------------------------------------------------------------------- | --------------------------------- |
| `/user`                   | **Activity Panel** — stats bar + compact recent 5 applications        | "Dashboard" (LayoutDashboardIcon) |
| `/user/applications`      | **Full Applications List** — enhanced: company logo, updatedAt column | "Applications" (FileTextIcon)     |
| `/user/applications/[id]` | **Application Detail** — split into ≤150-line sub-components          | — (linked from list)              |

All other user routes (`/user/profile`, `/user/resumes`, `/user/messages`, `/user/notifications`): **unchanged**.

## Files to Create

### 1. Statistics API — `app/api/user/applications/stats/route.ts`

```ts
// GET — returns { total, active, interviews, offers }
// active = status in ('applied', 'reviewing', 'shortlisted')
// interviews = status = 'interview_scheduled'
// offers = status in ('offered', 'hired')
// Uses prisma.application.count with where clauses, single Promise.all
```

### 2. Dashboard Activity Panel — `app/features/user/components/activity-panel.tsx` (≤150 lines)

Client component. Fetches stats + recent 5 applications from `/api/user/applications?pageSize=5&page=1`.

**Stats grid:** `grid-cols-2 sm:grid-cols-4` — 4 stat cards (Total, Active, Interviews, Offers).

**Recent activity list:** Compact table without pagination. Columns: Job title, Company (with logo initial), Status badge, Applied date, "View" link.

**Empty state:** "No applications yet" + "Browse Jobs" button linking to `/jobs`.

**Loading state:** 4 skeleton stat cards + 5 skeleton rows.

**Error state:** "Failed to load activity" + retry button.

### 3. Dashboard Page — `app/(roles)/user/page.tsx` (≤150 lines)

Server component. No metadata needed (just renders `ActivityPanel`). No explicit client boundary — embed import of ActivityPanel as 'use client'.

## Files to Modify

### 4. Application Queries — `app/features/user/queries/user-application-queries.ts`

Add `companyLogo` to `UserApplicationRow` type:

```ts
export type UserApplicationRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null; // NEW
  status: string;
  appliedAt: Date;
  updatedAt: Date;
};
```

Update Prisma include in `listUserApplications`:

```ts
include: { job: { include: { company: { select: { name: true, logoUrl: true } } } } }
```

Map `companyLogo: company.logoUrl` in the cast section.

### 5. Applications Page — `app/features/user/components/applications-page.tsx` (≤150 lines)

**Enhancements:**

- Add company logo column (initial fallback): `hidden sm:table-cell`
- Add `updatedAt` column: `hidden lg:table-cell` — "Last updated" relative date
- Logo + company name in same cell for compact layout
- All existing behavior preserved (search, status filters, pagination, empty/loading/error states)

### 6. Application Detail View — Split into ≤150-line components

**Existing file** `application-detail-view.tsx` (315 lines) → split into:

| Component                  | Lines | Purpose                                                                        |
| -------------------------- | ----- | ------------------------------------------------------------------------------ |
| `ApplicationDetailView`    | ~30   | Orchestrator, fetches data, renders sub-components                             |
| `ApplicationHeader`        | ~80   | Job title, company logo, status badge, meta tags (location, work mode, salary) |
| `ApplicationTimeline`      | ~80   | Status timeline from `statusChanges` array                                     |
| `ApplicationSections`      | ~80   | Rejection reason, interview details, offer details cards                       |
| `ApplicationResumeSection` | ~50   | Resume snapshot (file download or builder data preview)                        |
| `ApplicationActions`       | ~50   | Withdraw button + error display                                                |

All placed in `app/features/user/components/` with `application-` prefix.

### 7. Sidebar — `app/features/user/components/user-sidebar.tsx`

**No changes needed** — "Dashboard" already links to `/user`, "Applications" already links to `/user/applications`.

### 8. Back-link Path Updates

Update all `/user/applications` hardcoded paths where the destination should remain `/user/applications` (already correct). The apply success redirect in `apply-modal.tsx` should update from `/user/applications` to `/user/applications` (no change — it stays the full list page).

**Files with back-link changes (application detail → `/user/applications`):**

- `application-detail-view.tsx` lines 47, 65, 108 → already `/user/applications` (correct)
- `apply-modal.tsx` line 103 → `router.push("/user/applications")` (correct — redirects to full list)
- `revalidatePath("/user/applications")` in apply route line 113 → already correct
- `revalidatePath("/user/applications")` in withdraw route line 41 → already correct

**Notification routing:** `application_status` links in `notifications-page.tsx` and `notification-dropdown.tsx` → should link to `/user/applications/[id]` not `/user/applications`. Update both.

## Edge Cases (47 total)

### Loading (3)

1. Initial stats + activity load → dual skeleton
2. Stats loaded, activity pending → partial skeleton
3. Network failure → error banner + retry

### Empty States (3)

4. Zero applications → "No applications yet" + Browse Jobs
5. Zero applications but user has data elsewhere → fine
6. Exactly 1 → singular text "1 application"

### Data Edge Cases (6)

7. Withdrawn status → excluded from active/pipeline stats, shown in list (dimmed)
8. Rejected without reason → status shown, no reason block in detail
9. Hired → counted in Offers stat, green badge
10. Interview scheduled past date → still shows interview_scheduled
11. Stats query uses 4 standalone `prisma.application.count` calls via `Promise.all` — efficient
12. Stats filtering: withdrawn excluded from active/interviews/offers

### Responsive (3)

13. Stats: `grid-cols-2 sm:grid-cols-4`
14. Desktop full apps table: logo `hidden sm:table-cell`, updatedAt `hidden lg:table-cell`
15. Touch targets ≥36px on all buttons/filter pills

### Dashboard Scope (2)

16. Dashboard shows 5 most recent, no inline filters
17. Dashboard links to `/user/applications` for full list

### Back-link Accuracy (5)

18–22. All 5 existing `/user/applications` references checked — all correct for new routing (detail stays at `/user/applications/[id]`, list stays at `/user/applications`)

### Notification Routing (2)

23. `application_status` → `/user/applications/[id]` (not the list)
24. Other notification types unchanged

### Component Size (1)

25. `ApplicationDetailView` (315 lines) → 6 sub-components each ≤150 lines

### React Compiler (3)

26–28. All `new Date(...)` in JSX are pure reads — safe under React Compiler. No `Date.now()` in render. Verified.

### Build & Lint (3)

29. TypeScript strict: no `any`, `import type` for type-only imports
30. ESLint: no unused imports
31. 150-line cap on every component

### Stats API (4)

32–35. `GET /api/user/applications/stats` returns `{ total, active, interviews, offers }`. Uses 4 parallel `count` + `findMany({ take: 5 })` in a single `Promise.all`. No pagination needed.

### Full Apps Page Enhancements (3)

36. Company logo column: initial letter fallback if null
37. UpdatedAt column: relative time ("2 days ago") via compact formatter
38. Existing search/filter/pagination behavior preserved

### Withdraw (3)

39. Withdraw success → redirect to `/user/applications` (full list)
40. Withdraw blocked at `interview_scheduled`+ statuses — already enforced by route
41. Withdraw notify recruiter — already built in Step 3.5

### Error States (2)

42. Stats API fails → show partial dashboard (activity list only, stats show "—")
43. Activity list fails → show stats only, error banner for list

## Validation

1. Verify all 6 detail sub-components render correctly in all states (loading, error, empty, normal)
2. Verify stats match actual application counts
3. Verify `/user/applications` shows company logos + updatedAt
4. Verify all back-links navigate correctly
5. Verify notification links for `application_status` go to detail page
6. Run `npm run lint` — zero errors
7. Run `npx tsc --noEmit` — zero errors
8. Verify each new/modified component ≤150 lines
9. Responsive: test at 375px, 768px, 1024px widths
