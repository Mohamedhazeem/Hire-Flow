# Analytics Page Layout Fix

## Goal
Fix broken filter bar layout on desktop, align all filter controls consistently, reduce gap between work-mode and employment-type bar charts, equalize their heights, and apply the same fixes to both company-wide and per-job analytics pages.

## Files to modify (5)

### 1. `app/features/recruiter/components/filters/analytics-filter-bar.tsx`
**Current issue:** Desktop filter layout is broken — inconsistent widths, status chips break baseline alignment with `sm:items-end`, controls wrap unevenly.

**Changes:**

- Replace `sm:flex-row sm:flex-wrap sm:items-end` with a responsive grid:
  - **Mobile (base):** full-width stack (`flex-col gap-3`) — unchanged
  - **Tablet/Desktop (sm:):** `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3` — each child takes one cell, consistent alignment
- Set all filter controls to `w-full` (remove `sm:w-36`, `sm:w-48`, `sm:w-44`) — let the grid handle sizing
- Wrap status chips section in a `col-span-1` container so it occupies the same width as other controls
- The grid approach ensures all controls share the same baseline regardless of content height

### 2. `app/features/recruiter/components/recruiter-analytics-page.tsx`
**Current issue:** `gap-5` between stacked work-mode and employment-type bar charts is too large; FunnelChart height doesn't match the combined height.

**Changes:**

- Row 3 (FunnelChart + WorkMode/EmploymentType stack):
  - Add `items-stretch` to the `md:grid-cols-2` grid so both columns fill to match height
  - FunnelChart already fills naturally; the right column needs explicit `h-full` on the container
  - Change `space-y-5` to `space-y-2` (or `gap-2` if using flex) between the two bar charts
- Remove the hover lift effect (`hover:-translate-y-0.5 hover:shadow-md hover:border-brand/30`) from the DistributionBarChart cards — this pattern is inconsistent between chart types and creates visual noise on stacked cards. (Optional: keep if preferred.)

### 3. `app/features/recruiter/components/charts/distribution-bar-chart.tsx`
**Current issue:** Cards have inconsistent heights when stacked.

**Changes:**

- Add `flex flex-col h-full` to the root card wrapper so it stretches to fill the parent grid cell height when stacked with a sibling card
- The `h-full` on the card + `flex-1` on the `ResponsiveContainer` ensures both bar charts match height

### 4. `app/features/recruiter/components/per-job-analytics-page.tsx`
**Current issue:** Same chart row layout issues as the main page.

**Changes:**

- Apply the same `items-stretch` and spacing fixes as the main page's chart rows
- The simpler filter bar (`AnalyticsFilterBarPerJob`) already uses `sm:items-end` — no changes needed there (only 2 controls)

### 5. `app/features/recruiter/components/charts/funnel-chart.tsx`
**Current issue:** When placed in a grid with the stacked bar charts, the FunnelChart height should match.

**Changes:**

- Add `flex flex-col h-full` to the root card wrapper (same pattern as DistributionBarChart)

## Verification

| Check | How |
|---|---|
| Filter bar renders correctly on mobile | Stacked full-width, no overflow — test at 320px |
| Filter bar renders correctly on tablet | Grid `sm:grid-cols-3` — controls align on same baseline |
| Filter bar renders correctly on desktop | Grid `lg:grid-cols-4` or `xl:grid-cols-6` — no broken wraps |
| Status chips same height as selects | Grid cell ensures uniform height |
| WorkMode + EmploymentType bars same height | `flex flex-col h-full` + `flex-1` on chart |
| Gap between bars reduced | `space-y-2` instead of `space-y-5` |
| Per-job analytics page also fixed | Same chart layout changes applied |
| TypeScript passes | `npm run lint` — 0 errors |
| No visual regression on company-wide page | All breakpoints render without overflow |

## Non-goals

- No changes to data fetching (`useQuery`, `AnalyticsFilterSchema`, `getAnalytics`)
- No changes to chart rendering logic (bar shapes, colors, tooltips, X/Y axis)
- No changes to funnel chart rendering logic
- No new components or abstractions
