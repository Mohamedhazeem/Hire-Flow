# Phase 4.2 — Public Job Detail & View Tracking

## Goal

Enhance the existing `/jobs/[id]` detail page with view tracking, inactive job rendering (non-404), anonymous "Log in to Apply" CTA, dynamic metadata, and a polished company preview card. All components ≤150 lines, mobile-first, motion fade-in.

## What Already Exists (Phase 3 — Reuse)

| File                                           | Purpose                                                                                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/api/jobs/[id]/route.ts` (17 lines)        | GET handler with `withErrorHandler`. Currently throws 404 for inactive jobs — will modify to return them                                        |
| `getPublicJobById` in `public-job-queries.ts`  | Returns full detail + company info. Currently returns `null` for inactive — will remove inactive guard                                          |
| `job-detail-view.tsx` (240 lines, client)      | Full detail page: company info, description, skills, tags, salary, deadline, inactive banner, `SaveJobButton`, Apply Now. Will refactor to ≤150 |
| `app/jobs/[id]/page.tsx` (10 lines, server)    | Static metadata — will add `generateMetadata`                                                                                                   |
| `apply-modal.tsx` (205 lines)                  | Resume selection, cover letter. No changes needed                                                                                               |
| `app/api/jobs/[id]/apply/route.ts` (118 lines) | Full application pipeline with `requireRole`, rate limiting, notifications. No changes                                                          |
| `require-role.ts` (51 lines)                   | Role guard                                                                                                                                      |
| `auth-client.ts`                               | `useSession` for anonymous detection                                                                                                            |
| `info-row.tsx`                                 | Reusable label/value card                                                                                                                       |
| `job.viewCount` (Prisma field)                 | Already on `Job` model, used in recruiter/admin analytics                                                                                       |

## Files to Create

### 1. `app/api/jobs/[id]/view/route.ts` (~30 lines)

```ts
import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";
import { NotFoundError } from "@/lib/api-error";

async function handlePOST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!job) throw new NotFoundError("Job not found");
  checkRateLimit(`view:${id}`, { max: 100, windowMs: 60000 });
  await prisma.job.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  return ok({ data: { success: true } });
}

export const POST = withErrorHandler(handlePOST);
```

Edge cases: invalid ID → `NotFoundError`; rate limit 100/min → silent client-side failure; atomic `increment: 1`.

### 2. `components/shared/company-preview-card.tsx` (~60 lines)

```tsx
"use client";

import { GlobeIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";

type CompanyPreviewCardProps = {
  name: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  locations: string[];
};

export function CompanyPreviewCard({
  name,
  logo,
  website,
  description,
  locations,
}: CompanyPreviewCardProps) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 transition-colors hover:border-brand/20">
      <div className="flex items-start gap-4">
        <div className="size-12 sm:size-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0 text-2xl font-bold">
          {logo ? (
            <Image src={logo} alt="" width={36} height={36} className="size-9 object-contain" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-heading truncate">{name}</h3>
          {locations.length > 0 && (
            <p className="text-sm text-text-muted mt-0.5">
              <MapPinIcon className="size-3.5 inline mr-1" />
              {locations.join(", ")}
            </p>
          )}
        </div>
      </div>
      {description && (
        <p className="text-sm text-text-body mt-4 leading-relaxed line-clamp-3">{description}</p>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline mt-3"
        >
          <GlobeIcon className="size-3.5" /> Visit website <ChevronRightIcon className="size-3.5" />
        </a>
      )}
    </div>
  );
}
```

Edge cases: no logo → initial char; long name → `truncate`; no description → omitted; no website → omitted; no locations → MapPin row omitted; mobile 320px → `p-5 sm:p-6`.

## Files to Modify

### 3. `app/features/jobs/queries/public-job-queries.ts` (+10 lines)

**`PublicJobDetail` type — add:**

```ts
isActive: boolean;
status: string;
viewCount: number;
```

**`getPublicJobById` — change line 139:**

```ts
// Before:
if (!job || job.status !== "active" || !job.isActive) return null;
// After:
if (!job) return null;
```

**Add to return object:**

```ts
isActive: job.isActive,
status: job.status,
viewCount: job.viewCount,
```

Risk: The only caller is the API route. Previously it returned null for inactive jobs → 404. Now inactive jobs are returned. The UI handles the inactive display.

### 4. `app/api/jobs/[id]/route.ts` (no changes needed)

No changes needed. `if (!job)` guard stays for truly missing IDs. Inactive jobs are now returned instead of null.

### 5. `app/features/jobs/components/job-detail-view.tsx` (240→≤150 lines)

**Imports — remove/replace:**

- Remove `Image`, `Building2Icon`, `GlobeIcon`, `ChevronRightIcon` (moved to CompanyPreviewCard)
- Remove `useState` for `now` — use `Date.now()` inline for deadline checks
- Remove `Record<string, unknown>` casts — import `PublicJobDetail` and type the queryFn return
- Add `motion` from `motion/react` for fade-in
- Add `useEffect`, `useCallback` for view tracking fetch
- Add `CompanyPreviewCard` import
- Add `useSession` import

**Key logic changes:**

a) **Typed query**: Cast API response to `{ data: PublicJobDetail }` instead of `Record<string, unknown>`. All `d.xxx as string` casts become direct property access.

b) **Salary formatting fix** (pre-existing bug: currency prefix duplicated): Simplify to:

```ts
const salaryText =
  sMin != null && sMax != null
    ? `${currency}${sMin.toLocaleString()} - ${sMax.toLocaleString()}`
    : sMin != null
      ? `${currency}${sMin.toLocaleString()}+`
      : sMax != null
        ? `Up to ${currency}${sMax.toLocaleString()}`
        : null;
```

c) **View tracking effect**:

```tsx
useEffect(() => {
  if (!id) return;
  const controller = new AbortController();
  fetch(`/api/jobs/${id}/view`, { method: "POST", signal: controller.signal }).catch(() => {});
  return () => controller.abort();
}, [id]);
```

d) **Anonymous CTA** — replace "Apply Now" button with conditional:

```tsx
{
  session?.user ? (
    <button
      onClick={() => setShowApply(true)}
      disabled={deadlinePassed || !d.isActive || d.status !== "active"}
    >
      Apply Now
    </button>
  ) : (
    <Link
      href={`/login?returnUrl=${encodeURIComponent(`/jobs/${id}`)}`}
      className="... bg-brand hover:bg-brand/90 ..."
    >
      Log in to Apply
    </Link>
  );
}
```

e) **Motion wrapper** — wrap entire JSX in `motion.div` with `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`

f) **Company section** — replace inline (lines 154-172) with `<CompanyPreviewCard ... />`

### 6. `app/jobs/[id]/page.tsx` (+15 lines)

Replace static `metadata` with:

```tsx
import { getPublicJobById } from "@/app/features/jobs/queries/public-job-queries";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublicJobById(id);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.companyName}`,
    description: job.description?.slice(0, 160),
  };
}
```

Edge case: job not found → "Job Not Found" title; inactive job → metadata still shows title + description; no description → `slice(0, 160)` on undefined returns undefined → no meta description.

## Edge Cases Verified

| #   | Edge Case                            | Handling                                                                                              | File                                            |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------- | --------------------- |
| 1   | Invalid job ID                       | `getPublicJobById` returns null → `NotFoundError` → 404                                               | API route                                       |
| 2   | Inactive job (isActive=false)        | Query returns it → UI shows inactive banner + disabled apply                                          | `public-job-queries.ts` + `job-detail-view.tsx` |
| 3   | Inactive job (status=draft/archived) | Same as above — `!d.isActive                                                                          |                                                 | d.status !== "active"` | `job-detail-view.tsx` |
| 4   | Anonymous user                       | `useSession` null → "Log in to Apply" link with `returnUrl`                                           | `job-detail-view.tsx`                           |
| 5   | Concurrent view increments           | `increment: 1` is Prisma-atomic                                                                       | `view/route.ts`                                 |
| 6   | View rate limit exceeded             | `checkRateLimit` throws → `withErrorHandler` returns 429 → client `.catch(() => {})` silently ignores | `view/route.ts` + `job-detail-view.tsx`         |
| 7   | Component ≤150 lines                 | Extracting CompanyPreviewCard (60 lines) + removing Record casts saves ~100 lines                     | `job-detail-view.tsx`                           |
| 8   | Locs empty on CompanyPreviewCard     | `locations.length > 0` guard                                                                          | `company-preview-card.tsx`                      |
| 9   | No logo                              | `initial` character fallback                                                                          | `company-preview-card.tsx`                      |
| 10  | Long description                     | `line-clamp-3`                                                                                        | `company-preview-card.tsx`                      |
| 11  | No website                           | Link block omitted entirely                                                                           | `company-preview-card.tsx`                      |
| 12  | Slow view fetch                      | `AbortController` cleanup on unmount                                                                  | `job-detail-view.tsx`                           |
| 13  | generateMetadata for missing job     | `if (!job) return { title: "Job Not Found" }`                                                         | `page.tsx`                                      |
| 14  | generateMetadata for inactive job    | Returns title + description (no hide)                                                                 | `page.tsx`                                      |
| 15  | Salary: only min set                 | `"USD50,000+"` (currency not duplicated)                                                              | `job-detail-view.tsx`                           |
| 16  | Salary: only max set                 | `"Up to USD100,000"`                                                                                  | `job-detail-view.tsx`                           |
| 17  | Salary: both null                    | `null` → salary section hidden                                                                        | `job-detail-view.tsx`                           |
| 18  | `apiClient` type safety              | Cast to `{ data: PublicJobDetail }`, not `Record<string, unknown>`                                    | `job-detail-view.tsx`                           |
| 19  | Back/forward nav                     | `useEffect` re-fires view tracking on re-mount (acceptable, no dedup)                                 | `job-detail-view.tsx`                           |
| 20  | Very long job title                  | `truncate` class on h1                                                                                | `job-detail-view.tsx`                           |
| 21  | Mobile 320px                         | `p-4 md:p-6 lg:p-8` padding, `flex-col` wrapping                                                      | `job-detail-view.tsx`                           |

## Data Flow

```
/jobs/[id] (server page)
  └─ generateMetadata → getPublicJobById(id) → <title>: "Job Title at Company"
  └─ <JobDetailView />

JobDetailView (client)
  └─ useQuery → GET /api/jobs/[id] → getPublicJobById(id) → returns job (active or inactive)
  └─ useEffect → POST /api/jobs/[id]/view → increment viewCount
  └─ Render:
       ├─ motion.div fade-in wrapper
       ├─ Back to jobs link
       ├─ Title + company name + chip bar (location, work mode, type, level)
       ├─ Deadline banners (soon / passed / inactive)
       ├─ Salary
       ├─ CompanyPreviewCard
       ├─ Description
       ├─ Skills (brand-colored pills)
       ├─ Tags (muted pills)
       ├─ Footer: SaveJobButton + [Apply Now | Log in to Apply] + applicant count
       └─ ApplyModal (conditional, authenticated only)
```

## Validation Plan

1. `npx tsc --noEmit` — zero errors (critical: `PublicJobDetail` import path must resolve)
2. `npx eslint` — zero warnings
3. Visit `/jobs/[valid-active-id]` — full detail renders, company card shows
4. Visit `/jobs/[valid-inactive-id]` — detail renders with "no longer accepting" banner, disabled/CTA apply button
5. Visit `/jobs/[invalid-id]` — 404 "Job not found"
6. Anonymous: see "Log in to Apply" link → click → goes to `login?returnUrl=/jobs/{id}`
7. Authenticated: see "Apply Now" button + `SaveJobButton`
8. Check `job.viewCount` in DB increments after visit
9. `POST /api/jobs/[id]/view` with invalid ID → 404
10. Dynamic `<title>` matches `"{title} at {company}"`
11. Mobile 320px: no overflow, proper padding
12. Pre-existing `save-job-button.tsx` anonymous redirect still works
