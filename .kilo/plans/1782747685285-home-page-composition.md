# Phase 4.4 — Home Page Composition

## Goal
Replace the current landing page with the spec-ordered composition featuring a hero search bar, job categories strip, featured companies grid, and an employer CTA section. Mobile-first, modern aesthetic, `<150 lines` per component, `motion` for scroll-triggered and in-view animations.

## Context Files (read first)
- `lib/job-categories.ts` — `JOB_CATEGORIES` constant (5 entries: Technology, Healthcare, Finance, Marketing, Remote)
- `lib/routes.ts` — shared route constants (`isHiddenRoute`, `PUBLIC_CONTENT_PATHS`)
- `app/features/jobs/components/job-search-bar.tsx` — existing debounced search input, embed in hero
- `components/shared/company-preview-card.tsx` — existing company card, wrap in `<Link>` from parent
- `app/features/jobs/queries/public-job-queries.ts` — `listPublicJobs` with filter params (used by FeaturedJobs)
- `proxy.ts` — already redirects authenticated users from `/` to `/jobs`

## Existing Files to NOT Touch
- `hero-section.tsx` — replaced by `hero-search.tsx` (delete after replacement)
- `stats-banner.tsx` / `stats-counter.tsx` — removed from section order (no longer in spec)
- `featured-jobs.tsx` / `featured-jobs-grid.tsx` — keep as-is, already correct

## New Files (4)

### 1. `app/features/public/components/hero-search.tsx`
- `"use client"`, `<150 lines`
- Unsplash background image + gradient overlays (same aesthetic as current `hero-section.tsx`)
- Headline: "Find Your Dream Job or the Perfect Candidate"
- Subhead: tagline text
- **Embed `job-search-bar.tsx`** — the search bar navigates to `/jobs?q=...` (existing behavior)
- Two CTA buttons: "Browse Jobs" `/jobs`, "Sign Up Free" `/register`
- `motion.div` fade/slide-in on mount, staggered children, <300ms each

### 2. `app/features/public/components/category-strip.tsx`
- `"use client"` (uses `motion`), `<150 lines`
- Import `JOB_CATEGORIES` from `lib/job-categories.ts`
- Render as clickable tiles in a scrollable horizontal strip (mobile) or grid (sm+)
- Each tile links to `/jobs?industry=X` (for industry categories) or `/jobs?workMode=remote` (for Remote)
- No live job counts (deferred per spec)
- `motion.div` with `whileInView` stagger animation

### 3. `app/features/public/queries/list-featured-companies.ts`
- Server-only query function, no `"use client"`
- `export async function listFeaturedCompanies(limit = 6)`
- Prisma: `company.findMany` where `jobs.some({ status: 'active', isActive: true })`
- Select: `id, name, logoUrl, industry`, ordered by `jobs: { _count: 'desc' }`, take `limit`
- Return type: `Pick<Company, 'id' | 'name' | 'logoUrl' | 'industry'>[]`

### 4. `app/features/public/components/featured-companies.tsx`
- Server component (async), calls `listFeaturedCompanies()` directly
- Renders grid of `company-preview-card.tsx` wrapped in `<Link href={/jobs?companyId=${id}}>`
- Edge case: if zero companies returned, show empty state (no crash)
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`

### 5. `app/features/public/components/employer-cta.tsx`
- Static server component, `<150 lines`
- Section `id="for-employers"` for anchor linking
- Dark background (`bg-neutral-900` to match footer), centered content
- Heading: "Hiring? Let's talk."
- Paragraph explaining recruiter access is by invitation only
- Mailto link: `mailto:hello@hireflow.example?subject=Recruiter Access Request`
- No form, no API call — intentionally a contact funnel

## Files to Modify (2)

### 6. `app/features/landing/components/footer.tsx`
- Add "For Employers" link to the "Product" column (after "Browse Jobs"): `{ label: "For Employers", href: "/#for-employers" }`

### 7. `app/features/landing/components/landing-page.tsx`
Replace imports and section order:
- Remove: `HeroSection`, `StatsBanner` (no longer in spec)
- Add: `HeroSearch` from `@/app/features/public/components/hero-search`
- Add: `CategoryStrip` from `@/app/features/public/components/category-strip`
- Add: `FeaturedCompanies` from `@/app/features/public/components/featured-companies`
- Add: `EmployerCTA` from `@/app/features/public/components/employer-cta`

New order:
```
HeroSearch → CategoryStrip → FeaturedJobs → FeaturedCompanies → HowItWorks → Testimonials → EmployerCTA → Footer
```

## Delete
- `app/features/landing/components/hero-section.tsx` (replaced by `hero-search.tsx`)

## Edge Cases Verified
- Authenticated user hits `/` → proxy redirects to `/jobs` (never sees landing page)
- Featured Companies filter: `status: 'active' AND isActive: true` — no companies with zero live jobs appear
- Category Strip links: `/jobs?industry=Technology`, `/jobs?industry=Healthcare`, `/jobs?workMode=remote` — all resolve to existing filtered job listing
- Featured Companies cards link to `/jobs?companyId={id}` — filter already works (Step 4.1)
- No dedicated `/companies/[id]` route built (explicitly deferred)
- `job-search-bar.tsx` uses `useSearchParams` safely inside a `"use client"` tree
- Footer "For Employers" links to anchor `#for-employers`, not a non-existent page
- Zero companies returned → empty state, no crash
- All section links resolve to real pages or working filter URLs

## Validation
- `npx tsc --noEmit` — zero errors
- `npx eslint --quiet` on all new/modified files — zero warnings
- Verify every link target in the page resolves to a real route
- Verify `app/page.tsx` renders without error (no Suspense boundary needed for search bar since it's inside a client component tree)

## Designs Resolved
- **Route group**: Keep `app/page.tsx` (no `(public)` group)
- **Testimonials over 150 lines**: Accept as-is (158 lines)
- **Company card reuse**: No changes to `company-preview-card.tsx` — wrap with `<Link>` in `featured-companies.tsx`
- **Hero search**: New `hero-search.tsx` replaces `hero-section.tsx`
- **Stats banner**: Removed (no longer in spec section order)
