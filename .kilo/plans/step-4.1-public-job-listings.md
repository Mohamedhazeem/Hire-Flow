# Phase 4.1 — Public Job Listings

## Goal

Enhance the existing `/jobs` page with debounced search, extracted reusable components, motion animations, and `industry`/`companyId` filter support (types only — filter UI deferred). The core listing already works (query, API route, page); this step refines it.

## What Already Exists (No New Files Needed)

| File | Status |
|------|--------|
| `app/features/jobs/queries/public-job-queries.ts` | ✅ Filters `status: 'active'` + `isActive: true`. Pagination, search, workMode, employmentType, experienceLevel filters work |
| `app/api/jobs/route.ts` | ✅ GET handler passes all `searchParams` to query |
| `app/jobs/page.tsx` | ✅ Renders `JobListPage` |
| `app/features/jobs/components/job-list-page.tsx` | ✅ 251 lines. Client component with filters, skeleton, empty state, pagination |
| `app/features/jobs/components/job-card.tsx` | ✅ 145 lines. Includes `SaveJobButton` (redirect-on-click for anonymous) |
| `app/api/jobs/[id]/route.ts` | ✅ Returns 404 for inactive jobs |
| `app/features/jobs/hooks/use-apply-job.ts` | ✅ Application mutation |
| `app/features/auth/libs/auth-client.ts` | ✅ `useSession` for bookmark auth |

## What's Missing (This Step)

- **Debounced search** — current search fires only on Enter key. Replace with real-time debounce via `useDeferredValue`
- **Extracted `JobSearchBar`** — move search input into own component for reuse in Phase 4.4 hero
- **Extracted `FilterSelect`** — move `<select>` filter into own component for reuse
- **`companyId` + `industry` in query type** — add to `PublicJobListParams` so homepage (4.4) and detail page (4.2) can deep-link. Actual filter UI deferred
- **Motion stagger on job cards** — same `whileInView` stagger as landing page featured jobs
- **`lib/job-categories.ts`** — curated constant for Phase 4.4 homepage category strip

---

## Architecture

```
/jobs (app/jobs/page.tsx — server component, no change)
  └─ JobListPage (client — modified)
       ├─ JobSearchBar (new, extracted) — debounced input, useDeferredValue
       ├─ FilterSelect (new, extracted) — reusable dropdown filter
       ├─ JobCard[] (existing) — wrapped in motion.div stagger
       └─ Pagination buttons (existing) — no change
```

### Data Flow

```
User types in search
  → useDeferredValue (400ms settled)
  → router.push(`/jobs?search=...`) inside startTransition
  → searchParams change → queryKey changes → useQuery refetches
  → API /api/jobs?search=... → listPublicJobs → Prisma query → response
```

---

## Files to Modify

| File | Changes | Expected Lines |
|------|---------|---------------|
| `app/features/jobs/components/job-list-page.tsx` | Replace inline search with `JobSearchBar`, inline `<select>` with `FilterSelect`, wrap cards in motion stagger. Estimated 180–200 lines total (reduction from 251) | ≤200 |
| `app/features/jobs/queries/public-job-queries.ts` | Add `industry` and `companyId` to `PublicJobListParams` + query logic (deferred filter UI) | +15 |
| `app/api/jobs/route.ts` | Pass `industry`, `companyId` from searchParams | +4 |

## Files to Create

| File | Description | Lines |
|------|-------------|-------|
| `app/features/jobs/components/job-search-bar.tsx` | Debounced search input with `useDeferredValue`, `startTransition`, `useSearchParams` | ~60 |
| `app/features/jobs/components/filter-select.tsx` | Reusable `<select>` dropdown filter | ~40 |
| `lib/job-categories.ts` | Curated `JOB_CATEGORIES` constant for Phase 4.4 | ~12 |

---

## Component Specifications

### 1. `app/features/jobs/components/job-search-bar.tsx`

```tsx
"use client";

import { useRef, useState, useDeferredValue, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { useTransition } from "react";

export function JobSearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("search") ?? "");
  const deferredValue = useDeferredValue(value);
  const [isPending, startTransition] = useTransition();
  const initialRef = useRef(true);

  // Sync from URL on mount only (e.g. back/forward navigation)
  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      setValue(sp.get("search") ?? "");
    }
  }, [sp]);

  // Debounced URL push
  useEffect(() => {
    if (initialRef.current) return;
    const timer = setTimeout(() => {
      startTransition(() => {
        const np = new URLSearchParams(sp.toString());
        if (deferredValue) np.set("search", deferredValue);
        else np.delete("search");
        np.delete("page");
        router.push(`/jobs?${np.toString()}`);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [deferredValue, router, sp]);

  return (
    <div className="relative flex-1 min-w-0">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search jobs..."
        className="w-full pl-10 pr-8 py-2.5 text-sm bg-bg-surface border border-border-subtle rounded-lg text-text-body placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-text-muted hover:text-text-body"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}
```

**Edge cases:**
- **Back/forward navigation:** `useEffect` syncs URL → input value on `sp` changes after mount
- **Rapid typing:** Each keystroke cancels previous timer; only last settled value fires
- **Empty input:** `setValue("")` → deferred becomes `""` → `np.delete("search")` → clears filter
- **Pending state:** `isPending` from `useTransition` available for future loading indicator
- **SSR:** `useState("")` initial matches empty URL search param

### 2. `app/features/jobs/components/filter-select.tsx`

```tsx
"use client";

type FilterSelectProps = {
  label: string;
  paramKey: string;
  options: readonly string[];
  value: string | undefined;
  onChange: (key: string, v: string | undefined) => void;
  labels?: Record<string, string>;
};

export function FilterSelect({ label, paramKey, options, value, onChange, labels }: FilterSelectProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(paramKey, e.target.value || undefined)}
      aria-label={label}
      className="w-full sm:w-36 text-sm bg-bg-surface border border-border-subtle rounded-lg px-3 py-2 text-text-body appearance-none cursor-pointer transition-colors hover:border-brand/30"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {labels?.[opt] ?? opt.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </option>
      ))}
    </select>
  );
}
```

**Edge cases:**
- **No `labels` prop:** Falls back to capitalized `replace("_", " ")` formatting
- **Empty options array:** Only shows the default `<option>`
- **Null/undefined value:** `value ?? ""` matches the blank `<option>`

### 3. `lib/job-categories.ts`

```ts
export const JOB_CATEGORIES = [
  { label: "Technology", filter: { industry: "Technology" } },
  { label: "Healthcare", filter: { industry: "Healthcare" } },
  { label: "Finance", filter: { industry: "Finance" } },
  { label: "Marketing", filter: { industry: "Marketing" } },
  { label: "Remote", filter: { workMode: "remote" } },
] as const;
```

Note: `workMode: "remote"` matches the Prisma `WorkMode` enum value (lowercase, no underscore), not capitalized as in the spec. Existing filters use lowercase values — consistency matters.

### 4. `job-list-page.tsx` (modified)

Changes:
- Remove inline `Filter` component (replaced by `FilterSelect` import)
- Remove inline search input (replaced by `JobSearchBar` import)
- Add `motion.div` grid wrapper with `whileInView`, `staggerChildren: 0.08`
- Add `AnimatePresence` around the results grid for exit animation on filter change
- Each `JobCard` wrapped in `motion.div` with `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}`
- Skeleton grid also gets motion fade-in for loading state

**Edge cases:**
- **Empty results after filter** — `AnimatePresence` handles exit of old cards
- **Loading state** — skeletons render immediately, no stagger delay
- **Error state** — no animation, static error message
- **Pagination during stagger** — grid re-mounts on page change, stagger re-fires (acceptable)

### 5. `public-job-queries.ts` (modified)

Add to `PublicJobListParams`:
```ts
industry?: string;
companyId?: string;
```

Add to query `where`:
```ts
if (params.industry) {
  where.company = { industry: params.industry };
}
if (params.companyId) {
  where.companyId = params.companyId;
}
```

**Edge cases:**
- **`company.industry` is nullable** — Prisma handles null comparison gracefully; a filter for `industry: "Technology"` simply won't match companies with null industry
- **`companyId` with invalid ID** — returns 0 results, not an error

### 6. `app/api/jobs/route.ts` (modified)

Add to params extraction:
```ts
industry: url.searchParams.get("industry") || undefined,
companyId: url.searchParams.get("companyId") || undefined,
```

---

## Motion Animation Summary

| Element | Trigger | Animation |
|---------|---------|-----------|
| Job card grid | Scroll into view | `whileInView` stagger, each card `opacity: 0→1, y: 16→0`, 0.08s stagger |
| Filter change | URL update | `AnimatePresence` exit animation on old results grid |
| Search clear button | Appears | Instant (no animation needed) |
| Filter select hover | Hover | `hover:border-brand/30` transition |

---

## Edge Cases Summary

| Case | Handling |
|------|----------|
| Rapid search typing | `useDeferredValue` + 400ms timeout — only last settled value triggers URL push |
| Back/forward browser nav | `useEffect` syncs URL searchParams back to input state |
| Empty search after typing | Clear button sets `""` → URL param deleted → all jobs shown |
| `company.industry` is null | Prisma `where.company = { industry: "X" }` skips null entries naturally |
| `companyId` with invalid UUID | Zero results — no error thrown |
| 0 jobs after filter | Empty state shows, pagination hidden |
| Only 1 page of results | Pagination buttons hidden (`totalPages > 1` check) |
| Anonymous user on `/jobs` | `SaveJobButton` renders but redirects to `/login` on click (existing behavior) |
| Slow network | Skeleton grid shown during loading |
| Mobile viewport | Filters stack vertically, search takes full width |
| Pagination during stagger animation | Grid re-mounts, stagger re-fires on new results |

---

## Validation Plan

1. `npx tsc --noEmit` — zero errors
2. `npx eslint` — zero warnings
3. Navigate to `/jobs` — full listing renders
4. Type in search — debounce fires after 400ms, URL updates, results filter
5. Clear search — all results restored
6. Back/forward browser buttons — search input reflects URL state
7. Resize to mobile (320px) — filters stack, search full width
8. `?industry=Technology` directly — API returns filtered results
9. `?companyId=<valid>` directly — API returns company-specific results
10. Motion stagger plays on scroll into view
11. `SaveJobButton` renders and redirects anonymous users to `/login?returnUrl=...`

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `useDeferredValue` with `router.push` inside `setTimeout` causes stale closure | `sp` is stable per render; `router` is stable; `useRef` for initial mount guard |
| `AnimatePresence` exit animation flickers on page change | Grid has stable `key` based on data; only enters/exits when results array changes identity |
| Passing `industry` through Prisma `where.company` creates a join | Already an inner join via `company.name` in `include` — no performance regression |
| Stagger animation re-fires on every page change | Acceptable — brief flicker on page turn. `viewport={{ once: true }}` not possible since cards re-mount |
