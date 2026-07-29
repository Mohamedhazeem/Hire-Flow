# Execution Plan: Step 2.8 — Recruiter Analytics & Filters

**Date:** 2026-06-27
**Total new files:** 14  
**Modified files:** 3  
**Prisma migrations:** 0

---

## Design Decisions

| Decision                | Choice                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Data fetching           | **REST API + TanStack Query** (consistent with admin dashboard)                                    |
| Pages                   | **Both**: standalone `/recruiter/analytics` + per-job `/recruiter/jobs/[id]/analytics`             |
| Chart engine            | **recharts** (v3.8.1, already installed, used in admin dashboard)                                  |
| Chart types             | **Line** (daily trends), **Bar** (distributions), **Funnel** (pipeline drop-off)                   |
| Filter dimensions       | `job`, `dateFrom`, `dateTo` (calendar pickers), `status`, `workMode`, `employmentType`, `location` |
| Filter state            | URL `searchParams` for deep linking                                                                |
| Date range default      | Last 30 days, but user selects exact start/end via calendar `<input type="date">`                  |
| Funnel — current state  | `Application.status` GROUP BY — fast snapshot                                                      |
| Funnel — historical     | `ApplicationStatusChange` COUNT(DISTINCT applicationId) — reach-through                            |
| Fulfillment time        | `Application.updatedAt` when `status = 'hired'`                                                    |
| Route param consistency | **Rename `[jobId]` → `[id]`** for the applicants sub-route. Analytics uses `[id]`.                 |

---

## Prerequisite: Rename `[jobId]` to `[id]`

**Before this plan can be built**, the existing `[jobId]` folder must be renamed to `[id]`:

```
❌ app/(roles)/recruiter/jobs/[jobId]/applicants/page.tsx
✅ app/(roles)/recruiter/jobs/[id]/applicants/page.tsx
```

Update the import in the page file — no logic changes needed. This makes the route param consistent with `app/(roles)/recruiter/jobs/[id]/page.tsx` (the job detail page).

---

## File Manifest

### 1. Schema — `app/features/recruiter/schema/analytics.schema.ts`

```typescript
import { z } from "zod/v4";

export const AnalyticsFilterSchema = z.object({
  jobId: z.string().optional(),
  dateFrom: z.string().optional(),      // ISO date string
  dateTo: z.string().optional(),        // ISO date string
  status: z.string().optional(),        // comma-separated
  workMode: z.string().optional(),      // comma-separated
  employmentType: z.string().optional(),// comma-separated
  location: z.string().optional(),
});

export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;

// Inferred from query results — all types defined here
export type AnalyticsSummary = { ... };
export type TrendPoint = { date: string; count: number };
export type FunnelStage = { stage: string; count: number };
export type FunnelHistorical = { stage: string; uniqueApplications: number };
export type StageConversion = { fromStage: string; toStage: string; count: number };
export type JobBreakdownRow = { jobId: string; title: string; totalApplications: number; hired: number; conversionRate: number; avgFulfillmentDays: number | null; viewCount: number };

export type AnalyticsResponse = {
  dateRange: { from: string; to: string };
  summary: AnalyticsSummary;
  applicationTrend: TrendPoint[];
  hireTrend: TrendPoint[];
  applicationsByStatus: FunnelStage[];
  applicationsByWorkMode: Array<{ workMode: string; count: number }>;
  applicationsByEmploymentType: Array<{ employmentType: string; count: number }>;
  topJobsByApplications: Array<{ jobId: string; title: string; count: number }>;
  funnelCurrent: FunnelStage[];
  funnelHistorical: FunnelHistorical[];
  stageConversions: StageConversion[];
  jobBreakdown: JobBreakdownRow[];
};
```

### 2. Queries — `app/features/recruiter/queries/analytics-queries.ts`

Two exported async functions:

- **`getAnalytics(companyId: string, filter: AnalyticsFilter): Promise<AnalyticsResponse>`**
  - Runs ~8-10 Prisma queries in parallel via `Promise.all`
  - Uses `prisma.$queryRaw` for aggregated queries (trends, funnel, conversions)
  - Uses `prisma.job.count()` / `prisma.application.count()` for simple counts
  - All company-scoped via `job: { companyId }` or `job.companyId` in SQL
  - Filters applied as optional WHERE clauses
  - Default date range: `dateFrom = 30 days ago`, `dateTo = now` when not provided
  - Funnel historical: `SELECT toStatus, COUNT(DISTINCT applicationId) FROM application_status_change asc JOIN application a ON asc.applicationId = a.id JOIN job j ON a.jobId = j.id WHERE j.companyId = $1 GROUP BY toStatus`
  - Fulfillment: `SELECT AVG(EXTRACT(EPOCH FROM (a.updatedAt - a.appliedAt))/86400) FROM application a JOIN job j ON a.jobId = j.id WHERE j.companyId = $1 AND a.status = 'hired'`
  - Per-job breakdown: GROUP BY jobId, joins to job table for title

- **`getJobAnalytics(companyId: string, jobId: string, filter: AnalyticsFilter): Promise<AnalyticsResponse>`**
  - Same shape as `getAnalytics()` but all queries additionally filtered by `a.jobId = $jobId`
  - No `jobBreakdown` array (only one job)
  - No `topJobsByApplications` array
  - Runs 404 if job doesn't exist or doesn't belong to company

### 3. API Routes

**`app/api/recruiter/analytics/route.ts`** — GET handler

```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found");

  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  const filter = AnalyticsFilterSchema.parse(searchParams);
  const data = await getAnalytics(companyId, filter);
  return ok(data);
});
```

**`app/api/recruiter/jobs/[id]/analytics/route.ts`** — GET handler

Same pattern but with `applicationId` from params, calls `getJobAnalytics()`.

### 4. Hook — `app/features/recruiter/hooks/use-analytics.ts`

```typescript
export function useAnalytics(filter: AnalyticsFilter) {
  return useQuery<AnalyticsResponse>({
    queryKey: ["recruiter", "analytics", filter],
    queryFn: () =>
      apiClient("/api/recruiter/analytics", { params: filter as Record<string, unknown> }),
  });
}

export function useJobAnalytics(jobId: string, filter: AnalyticsFilter) {
  return useQuery<AnalyticsResponse>({
    queryKey: ["recruiter", "analytics", jobId, filter],
    queryFn: () =>
      apiClient(`/api/recruiter/jobs/${jobId}/analytics`, {
        params: filter as Record<string, unknown>,
      }),
    enabled: !!jobId,
  });
}
```

### 5. Charts (3 reusable components)

**`app/features/recruiter/components/charts/trend-chart.tsx`**

- Reusable LineChart wrapper
- Props: `data: TrendPoint[]`, `dataKey: "applicationTrend" | "hireTrend"`, `color: string`, `title: string`, `emptyMessage?: string`
- Uses same `CHART_TOOLTIP_STYLE` and gradient def pattern as admin dashboard
- X-axis: date formatting (month/day), Y-axis: integer, no decimals
- Empty state: inline text, not an error

**`app/features/recruiter/components/charts/distribution-bar-chart.tsx`**

- Reusable BarChart wrapper
- Props: `data: Array<{ label: string; value: number }>`, `colorMap: Record<string, string>`, `title: string`, `emptyMessage?: string`
- Maps `data` to recharts format: `dataKey="value"`, XAxis uses `label`
- Uses `Bar` with `radius={[6,6,0,0]}` and custom `shape` for per-bar coloring (same pattern as admin WorkMode chart)

**`app/features/recruiter/components/charts/funnel-chart.tsx`**

- Props: `current: FunnelStage[]`, `historical: FunnelHistorical[]`, `conversions: StageConversion[]`, `emptyMessage?: string`
- Renders a custom funnel visualization (not recharts FunnelChart — it's limited)
- Each stage row: `[Stage Name] [Count] [Drop-off %] [Bar visualization]`
- Current-state series and historical series shown side-by-side in a two-column layout
- Drop-off % calculation: `if (prevCount === 0) return "—"; return ((1 - count/prevCount) * 100).toFixed(1) + "%"`
- Stage order: `applied → reviewing → shortlisted → interview_scheduled → offered → hired`
- Uses `ApplicationStatusSchema` enum order from `application.schema.ts`

### 6. Filters — `app/features/recruiter/components/filters/analytics-filter-bar.tsx`

- **Props:** `filter: AnalyticsFilter`, `onFilterChange: (filter: AnalyticsFilter) => void`, `jobOptions: Array<{ id: string; title: string }>`
- Renders a row of filter controls:
  - **Job select** (dropdown, only shown on standalone page, not on per-job)
  - **Date from** (`<input type="date">`)
  - **Date to** (`<input type="date">`)
  - **Status** (multi-select checkboxes or select with multiple, shows colored dots same as applicants table)
  - **Work mode** (multi-select)
  - **Employment type** (multi-select)
  - **Location** (text input, comma-separated — OR logic with PostgreSQL `&&`)

Mobile: `flex-col sm:flex-row`, wraps naturally. Each filter has a label above it.

On filter change: updates URL `searchParams` via `router.push` (deep linking).

### 7. Standalone Page — `app/features/recruiter/components/recruiter-analytics-page.tsx`

Main client component for `/recruiter/analytics`.

- Reads filters from `useSearchParams()` (URL)
- Fetches job list for the selector: `useQuery(["recruiter", "jobs", "list"])` — reuses existing endpoint
- Calls `useAnalytics(filter)` with current URL params
- Renders:
  1. `PageHeader` with title "Analytics" + `BarChart3Icon`
  2. `AnalyticsFilterBar`
  3. 4 `StatCard` row: Total Applications, Avg/Job, Conversion Rate, Avg Fulfillment Days
  4. Grid: `TrendChart` (application trend) + `DistributionBarChart` (status distribution)
  5. Grid: `FunnelChart` (pipeline) + `DistributionBarChart` (work mode)
  6. `DataTable`: per-job breakdown (columns: Job Title, Applications, Hired, Conversion %, Avg Days, Views)

Loading/error/empty states match the pattern from `admin-dashboard.tsx`.

### 8. Per-Job Page — `app/features/recruiter/components/per-job-analytics-page.tsx`

Client component for `/recruiter/jobs/[id]/analytics`.

- Props: `jobId: string`
- Reads date range filters from `useSearchParams()`
- Calls `useJobAnalytics(jobId, filter)`
- Renders:
  1. Tab navigation bar (same as job-detail.tsx) — links to `..` (job detail), `../applicants`, `.` (analytics)
  2. 3 `StatCard` row: Total Applications, Hired, Conversion Rate
  3. Grid: `TrendChart` (14-day or filtered trend) + `FunnelChart` (pipeline)
  4. Optional: `DistributionBarChart` (status distribution)

### 9. Tab Navigation — Modify `job-detail.tsx`

Add a tab/navigation bar above the job information that links to the three sub-routes:

```tsx
// At top of JobDetail component, after the back button:
<div className="flex gap-4 border-b border-border-subtle mb-6">
  <Link
    href={`/recruiter/jobs/${jobId}`}
    className={cn(
      "pb-3 text-sm font-medium border-b-2 transition-colors",
      isActive
        ? "border-brand text-text-heading"
        : "border-transparent text-text-muted hover:text-text-heading",
    )}
  >
    View Details
  </Link>
  <Link
    href={`/recruiter/jobs/${jobId}/applicants`}
    className={cn(
      "pb-3 text-sm font-medium border-b-2 transition-colors",
      isActive
        ? "border-brand text-text-heading"
        : "border-transparent text-text-muted hover:text-text-heading",
    )}
  >
    Applicants
  </Link>
  <Link
    href={`/recruiter/jobs/${jobId}/analytics`}
    className={cn(
      "pb-3 text-sm font-medium border-b-2 transition-colors",
      isActive
        ? "border-brand text-text-heading"
        : "border-transparent text-text-muted hover:text-text-heading",
    )}
  >
    Analytics
  </Link>
</div>
```

The `isActive` detection uses `usePathname()` from `next/navigation` to highlight the correct tab.

### 10. Page Wrappers

**`app/(roles)/recruiter/analytics/page.tsx`** — simple server component:

```tsx
export const metadata = {
  title: "Analytics | HireFlow",
  description: "Recruiter analytics and insights",
};
export default function AnalyticsPage() {
  return <RecruiterAnalyticsPage />;
}
```

**`app/(roles)/recruiter/jobs/[id]/analytics/page.tsx`** — server component:

```tsx
export const metadata = { title: "Job Analytics | HireFlow" };
export default async function JobAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PerJobAnalyticsPage jobId={id} />;
}
```

---

## Edge Cases & Safeguards

| Edge case                                 | How it's handled                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 0 applications                            | Empty state in each chart, not an error. StatCard shows "0". Funnel shows all stages at 0.              |
| `bigint` from `$queryRaw`                 | Cast via `Number(r.count)` — same as admin dashboard                                                    |
| Funnel drop-off NaN                       | Guard: `prevCount > 0 ? ((1 - count/prevCount)*100).toFixed(1) : "—"`                                   |
| Calendar date `dateFrom > dateTo`         | Zod refinement: `dateFrom < dateTo`. If invalid, fall back to 30-day default.                           |
| Missing date params                       | Default to `dateFrom = 30 days ago`, `dateTo = now`                                                     |
| Comma-separated filter empty after split  | Skip empty strings, don't add empty filter clause                                                       |
| Location filter with no matches           | PostgreSQL array `&&` handles overlap. No match = empty result set = empty state.                       |
| Job filter with no matching jobs          | (Standalone) Remove job filter, show cross-company data. Never 404 on standalone.                       |
| Per-job analytics for missing job         | 404 via `notFound()` in the wrapper page                                                                |
| Very large dataset >10k                   | All aggregated queries use indexed columns. `$queryRaw` with GROUP BY is efficient.                     |
| `avgFulfillmentDays` when no one is hired | Return `null`, StatCard shows "—"                                                                       |
| Concurrent filter changes                 | Each `router.push` replaces URL, TanStack Query dedupes via `queryKey`                                  |
| Mobile 320px                              | Charts use `ResponsiveContainer width="100%"`. Filter bar stacks. Tab bar horizontal scrolls if needed. |

---

## Implementation Order

1. **Rename**: `[jobId]` → `[id]` folder, update import in applicants page
2. **Schema**: `analytics.schema.ts` — types + Zod
3. **Queries**: `analytics-queries.ts` — `getAnalytics()`, `getJobAnalytics()`
4. **API routes**: Both GET endpoints
5. **Hook**: `use-analytics.ts`
6. **Charts**: `trend-chart.tsx`, `distribution-bar-chart.tsx`, `funnel-chart.tsx`
7. **Filters**: `analytics-filter-bar.tsx`
8. **Standalone page**: `recruiter-analytics-page.tsx` + `/recruiter/analytics/page.tsx`
9. **Per-job page**: `per-job-analytics-page.tsx` + `/recruiter/jobs/[id]/analytics/page.tsx`
10. **Tab nav**: Modify `job-detail.tsx` to add tab navigation bar
11. **MANIFEST.md**: Update with new files and completion status

## Verification

```bash
npx tsc --noEmit
npx eslint app/features/recruiter/schema/analytics.schema.ts app/features/recruiter/queries/analytics-queries.ts app/api/recruiter/analytics/route.ts app/api/recruiter/jobs/\[id\]/analytics/route.ts app/features/recruiter/hooks/use-analytics.ts app/features/recruiter/components/charts/*.tsx app/features/recruiter/components/filters/*.tsx app/features/recruiter/components/*-analytics-*.tsx app/features/recruiter/components/job-detail.tsx
```
