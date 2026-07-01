# Plan: Phase 4.5 — Career Resources

## Overview

A single static `/resources` page with hardcoded career advice sections: resume tips, interview prep checklist, salary negotiation basics. No CMS, no database model, no dynamic routing. Then wire it into the Footer if built.

All components ≤150 lines, mobile-first, design consistent with existing landing page aesthetic (Tailwind v4 theme tokens, `motion` scroll-reveal, lucide icons).

## Step 1: Create `app/features/public/components/career-resources-page.tsx`

A Server Component (no data fetching) that renders the full `/resources` page.

**Sections:**
1. **Hero** — page title + subtitle
2. **Resume Tips** — bullet-style cards (tailor resume, quantify impact, ATS keywords, proofread)
3. **Interview Prep Checklist** — vertical timeline checklist with icons
4. **Salary Negotiation Basics** — accordion-style FAQ (do research, don't share first number, consider total comp, practice)
5. **CTA** — "Ready to find your next role?" → Link to /jobs

**Constraints:**
- Mobile-first responsive: `px-4 md:px-6 lg:px-8`, `py-16 sm:py-20`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, etc.
- All content hardcoded (static arrays or inline)
- Zero Prisma / API calls
- `< 150 lines`
- Use existing theme tokens: `text-text-heading`, `bg-bg-surface`, `border-border-subtle`, `bg-brand/10`, etc.
- `motion` for scroll-reveal animation on section headers
- Lucide icons for visual anchors (FileTextIcon, CheckCircle2Icon, DollarSignIcon, ArrowRightIcon)
- Empty/edge-case immune: no user-generated content to handle

## Step 2: Create `app/(resources)/page.tsx`

Route group `(resources)` keeps URL as `/resources` without affecting path.

```tsx
import { CareerResourcesPage } from "@/app/features/public/components/career-resources-page";

export const metadata = {
  title: "Career Resources",
  description: "Resume tips, interview prep, and salary negotiation advice to help you land your next role.",
};

export default function ResourcesPage() {
  return <CareerResourcesPage />;
}
```

## Step 3: Update Footer to link to `/resources`

In `app/features/landing/components/footer.tsx`, locate the "Resources" column links, replace `{ label: "Blog", href: "#" }` and `{ label: "Guide", href: "#" }` with:

```ts
{ label: "Career Resources", href: "/resources" },
```

Remove `{ label: "FAQ", href: "#" }` (it was a placeholder). Keeps only the live link.

Check `isHiddenRoute` in `lib/routes.ts` — `/resources` doesn't match any hidden prefix, so the PublicNavbar will show correctly.

## Verification

1. `npx tsc --noEmit` — zero type errors
2. `npx eslint --quiet` — zero lint errors
3. `/resources` renders all sections, no console errors
4. Footer "Career Resources" link navigates to `/resources`
5. No dangling `#` links in the resources column

## Edge Cases Covered

- No data fetching → nothing to fail
- Empty section arrays → sections are hardcoded, never empty
- Mobile → `overflow-x-auto` not needed (no horizontal scroll sections)
- Reduced motion → `motion` respects `prefers-reduced-motion`
- No CMS → static hardcode is the intentional design
- No `(public)` route group (not yet built) → uses `(resources)` which doesn't affect URL
- Footer resources column: only live link, no broken `href="#"` placeholders
