# Execution Plan: Step 2.9 — Recruiter Dashboard

**Date:** 2026-06-27
**New files:** 2 (`queries/dashboard-queries.ts`, `components/recruiter-dashboard.tsx`)
**Modified files:** 1 (`app/(roles)/recruiter/page.tsx`)
**API routes:** 0
**Prisma migrations:** 0

---

## Goal

Replace the `"RECRUITER DASHBOARD"` placeholder at `/recruiter` with a fast, server-driven landing page — stat cards, recent applications table, and quick action buttons. No charts. Completely different from the analytics page (Step 2.8).

## Architecture

```
page.tsx (server component)
  └─ calls getRecruiterDashboardStats(companyId) directly from Prisma
  └─ passes DashboardData to RecruiterDashboard (client component)
       ├─ StatCard × 4
       ├─ DataTable (recent 5 applications)
       └─ Quick action links (Create Job, Invite Team, View Jobs, View Analytics)
```

No REST API, no TanStack Query for initial load. The server component renders instantly — the client component is only needed for `DataTable` interactive features and link navigations.

## Data Query — `app/features/recruiter/queries/dashboard-queries.ts`

```typescript
export type DashboardData = {
  totalJobs: number;
  totalApplications: number;
  pendingReviews: number; // status = applied OR reviewing
  newThisWeek: number; // appliedAt >= 7 days ago
  recentApplications: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    userName: string | null;
    userId: string;
    status: string;
    appliedAt: Date;
  }>;
};
```

**Query function `getRecruiterDashboardStats(companyId: string): Promise<DashboardData>`**

Runs 5 parallel Prisma calls via `Promise.all`:

1. `prisma.job.count({ where: { companyId } })` — totalJobs
2. `prisma.application.count({ where: { job: { companyId } } })` — totalApplications
3. `prisma.application.count({ where: { job: { companyId }, status: { in: ["applied", "reviewing"] } } })` — pendingReviews
4. `prisma.application.count({ where: { job: { companyId }, appliedAt: { gte: 7daysAgo } } })` — newThisWeek
5. `prisma.application.findMany({ where: { job: { companyId } }, orderBy: { appliedAt: "desc" }, take: 5, select: { id, status, appliedAt, job: { select: { id: true, title: true } }, user: { select: { id: true, name: true } } } })` — recentApplications

## Page — `app/(roles)/recruiter/page.tsx`

Server component. Imports `requireRole` from `features/shared/api/require-role` to get the session, then calls `getRecruiterDashboardStats(session.companyId)`.

If `session.companyId` is null (recruiter hasn't created a company yet), return early with a prompt to create a company profile instead of showing the dashboard.

```tsx
export default async function RecruiterPage() {
  const session = await requireRole(["recruiter"]);
  if (!session.companyId) {
    return <NoCompanyPrompt />; // inline server component
  }
  const data = await getRecruiterDashboardStats(session.companyId);
  return <RecruiterDashboard data={data} />;
}
```

## Client Component — `app/features/recruiter/components/recruiter-dashboard.tsx`

**Props:** `data: DashboardData`

Renders three sections:

### 1. Page Header

- Title: "Dashboard"
- Description: "Overview of your recruiting activity"

### 2. Stat Cards (`grid-cols-2 sm:grid-cols-4 gap-4`)

| Card               | Icon             | Value                    | Description                                                                 | Gradient |
| ------------------ | ---------------- | ------------------------ | --------------------------------------------------------------------------- | -------- |
| Total Jobs         | `BriefcaseIcon`  | `data.totalJobs`         | `data.totalJobs === 1 ? "1 job posted" : \`${data.totalJobs} jobs posted\`` | emerald  |
| Total Applications | `FileTextIcon`   | `data.totalApplications` | `"Across all job postings"`                                                 | purple   |
| Pending Reviews    | `ClockIcon`      | `data.pendingReviews`    | `"Awaiting your decision"`                                                  | amber    |
| New This Week      | `TrendingUpIcon` | `data.newThisWeek`       | `"Last 7 days"`                                                             | blue     |

All cards use the existing `StatCard` component from `components/ui/stat-card.tsx`.

### 3. Recent Applications Table

If `data.recentApplications.length === 0`:

- Show a centered empty state: "No applications yet. Post your first job to start receiving applications." with a "Create New Job" button.

If `data.recentApplications.length > 0`:

- Use existing `DataTable` component from `components/ui/data-table.tsx`
- Columns: Applicant Name, Job Title, Status (StatusBadge), Applied Date
- Each row links to `/recruiter/applicants/${application.id}` via an `onRowClick` or wrapping the cell in a Link
- Wrapped in `overflow-x-auto` with `min-w-0` on parent. Labels `hidden sm:inline` for icon-only mobile.

### 4. Quick Action Buttons

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Link href="/recruiter/jobs/new">+ Create New Job</Link>
  <Link href="/recruiter/team">+ Invite Team Member</Link>
  <Link href="/recruiter/jobs">View All Jobs</Link>
  <Link href="/recruiter/analytics">View Analytics</Link>
</div>
```

Each button is a styled card/button with an icon. Styled consistently: `rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30 transition-all`.

If `data.totalJobs === 0`, the "View All Jobs" button shows muted styling.

## Edge Cases

| Edge case                       | Handling                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **No company**                  | `requireRole` succeeds but `companyId` is null → render `NoCompanyPrompt` with message + link to `/recruiter/company` |
| **No jobs**                     | Stat cards show 0. Empty state in Recent Apps. "Create New Job" prominently styled.                                   |
| **No recent apps**              | Empty state with message + CTA button                                                                                 |
| **0 pending reviews**           | Stat card shows 0, description: "No pending reviews"                                                                  |
| **0 new this week**             | Stat card shows 0, description: "No new applications this week"                                                       |
| **Large numbers**               | `toLocaleString()` in StatCard                                                                                        |
| **DB error**                    | `getRecruiterDashboardStats` throws → Next.js error boundary catches it                                               |
| **User name null**              | Table shows "—"                                                                                                       |
| **Concurrent application**      | Server-rendered snapshot is acceptable; navigation re-fetches                                                         |
| **Application status mismatch** | Raw status shown; StatusBadge has fallback styling                                                                    |

## Files to Create

1. `app/features/recruiter/queries/dashboard-queries.ts` — `DashboardData` type + `getRecruiterDashboardStats()`
2. `app/features/recruiter/components/recruiter-dashboard.tsx` — client component with stat cards, table, actions

## Files to Modify

1. `app/(roles)/recruiter/page.tsx` — replace placeholder with server component that calls query + renders dashboard

## Files NOT to Modify

- No changes to sidebar, layout, analytics, or any existing files outside the above.
- The job-detail.tsx tab navigation (Step 2.8) remains unchanged.

## Verification

```bash
npx tsc --noEmit
npx eslint app/features/recruiter/queries/dashboard-queries.ts app/features/recruiter/components/recruiter-dashboard.tsx app/\(roles\)/recruiter/page.tsx
```

Update MANIFEST.md: mark Step 2.9 complete, bump `Last Updated`, append file paths.
