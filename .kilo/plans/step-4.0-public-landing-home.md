# Phase 4.0 — Public Landing Page & Home Route

## Goal

Replace the bare `/` (`app/page.tsx`) with a full marketing landing page for unauthenticated visitors, redirect authenticated users to their dashboard, add unsplash hero imagery, motion animations on scroll/click/hover, and a featured jobs grid reusing existing `JobCard`.

---

## Architecture & Data Flow

```
User visits /
  ├─ proxy.ts line 22 catches authenticated users → redirect to dashboard (already works)
  └─ Unauthenticated reaches app/page.tsx → render LandingPage (server component shell)
  │
  LandingPage (server component — app/page.tsx)
  ├─ HeroSection (client)        — unsplash bg, motion fade-in, CTA buttons
  ├─ StatsBanner (server)        — static stats with motion counters
  ├─ FeaturedJobs (server)       — fetches 6 active jobs via listPublicJobs({pageSize:6})
  │   └─ FeaturedJobsGrid(client) — renders JobCard[], scroll-triggered stagger animation
  ├─ HowItWorks (client)         — 3-step cards, hover scale + click animation
  ├─ Testimonials (client)       — carousel, auto-rotate, pagination dots
  └─ Footer (server)             — links, brand, social placeholders
```

### Key Decisions

- **Session check via `getSession()`** — server component at `/page.tsx`, redirect before any render
- **Unsplash images** — https://images.unsplash.com/photo-...?w=1200&q=80, add remotePatterns to `next.config.ts`
- **Motion** — `from "motion/react"` (already installed v12.40), `motion.div` for scroll-triggered animations via `whileInView`, `viewport={{ once: true }}`, hover via `whileHover`, click via `whileTap`
- **Featured jobs** — call existing `listPublicJobs({ pageSize: 6 })`, reuses `JobCard` component
- **Components ≤150 lines** — each section extracted to own file
- **Mobile-first** — base styles for 320px, `sm:`/`md:`/`lg:` breakpoints per project conventions
- **No DB dependency** for stats — static values, no Prisma call

---

## Files to Create/Modify

### Modified Files

| File              | Changes                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| `app/page.tsx`    | Replace bare Link with `LandingPage` (proxy.ts already handles auth redirect) |
| `next.config.ts`  | Add `images.remotePatterns` for `images.unsplash.com`                         |
| `app/layout.tsx`  | No changes needed (root layout already wraps children)                        |
| `app/globals.css` | No changes (existing tokens sufficient)                                       |

### New Files

| File                                                     | Description                                         | Lines        |
| -------------------------------------------------------- | --------------------------------------------------- | ------------ |
| `app/features/landing/components/landing-page.tsx`       | Orchestrator — composes all landing sections        | ~30          |
| `app/features/landing/components/hero-section.tsx`       | Hero with unsplash bg, motion text, CTA buttons     | ~150         |
| `app/features/landing/components/stats-banner.tsx`       | Static stats row with `useInView` counter animation | ~80          |
| `app/features/landing/components/featured-jobs.tsx`      | Fetches 6 active jobs, renders grid                 | ~30 (server) |
| `app/features/landing/components/featured-jobs-grid.tsx` | Client grid with stagger animation                  | ~50          |
| `app/features/landing/components/how-it-works.tsx`       | 3-step cards with hover/click animation             | ~100         |
| `app/features/landing/components/testimonials.tsx`       | Auto-rotating testimonial carousel                  | ~150         |
| `app/features/landing/components/footer.tsx`             | Full footer with links, social icons                | ~100         |
| `app/features/landing/components/stats-counter.tsx`      | Reusable animated counter component                 | ~40          |

### Total: ~730 lines across 9 new files + 2 modified files

---

## Component Specifications

### 1. `app/page.tsx` (modified)

```tsx
// Server component — proxy.ts already redirects authenticated users, so this only renders for unauthenticated visitors
import { LandingPage } from "@/app/features/landing/components/landing-page";

export default function Home() {
  return <LandingPage />;
}
```

### 2. `next.config.ts` (modified)

Add to `remotePatterns`:

```ts
{ protocol: "https", hostname: "images.unsplash.com" },
```

### 3. `landing-page.tsx` (orchestrator)

Pure composition — no state, no client directives. Renders sections in order:

```
<HeroSection />
<StatsBanner />
<FeaturedJobs />
<HowItWorks />
<Testimonials />
<Footer />
```

### 4. `hero-section.tsx` (client)

- Full-viewport unsplash background image (https://images.unsplash.com/photo-1521737711867-e3b97375f3f9?w=1200&q=80 — team workspace)
- Dark overlay gradient for text readability
- `motion.div` heading: `initial={{ opacity: 0, y: 30 }}` `animate={{ opacity: 1, y: 0 }}` `transition={{ duration: 0.6 }}`
- Subtitle with `transition={{ delay: 0.2 }}`
- Two CTA buttons stacked on mobile, inline on sm+:
  - "Browse Jobs" → `Link href="/jobs"` (primary `bg-brand` style)
  - "Sign Up Free" → `Link href="/register"` (outlined style)
- Bottom decorative fade gradient (`bg-gradient-to-t from-bg-page`)
- **Edge cases:** mobile viewport (shorter hero, smaller text), slow connection (bg loads async), missing image (fallback gradient)
- Unsplash credit text (tiny, bottom-right, `text-white/40`)

### 5. `stats-banner.tsx` (server + client counter)

- Section with 4 stat cards in a `grid-cols-2 lg:grid-cols-4 gap-6` layout
- Stats: "10K+ Jobs Posted", "5K+ Companies", "50K+ Applicants", "95% Satisfaction"
- Each stat uses `StatsCounter` component for animated count-up on scroll
- **Edge case:** reduced motion preference (`prefers-reduced-motion`) — skip animation, show final value immediately

### 6. `stats-counter.tsx` (client)

- `useRef<HTMLSpanElement>`, `useInView()` from `motion/react`
- When in view, `requestAnimationFrame` loop counting from 0 to target over 1.5s, easing out
- Respects `prefers-reduced-motion` via `window.matchMedia("(prefers-reduced-motion: reduce)").matches`
- **Edge case:** rapid scroll past — only fires once via `once: true`

### 7. `featured-jobs.tsx` (server component)

```tsx
import { listPublicJobs } from "@/app/features/jobs/queries/public-job-queries";
import { FeaturedJobsGrid } from "./featured-jobs-grid";

export async function FeaturedJobs() {
  const result = await listPublicJobs({ pageSize: 6 });
  return <FeaturedJobsGrid jobs={result.jobs} />;
}
```

- **Edge case:** 0 jobs returned → show "No featured jobs right now" message with link to `/jobs`

### 8. `featured-jobs-grid.tsx` (client)

- `motion.div` container with `whileInView` + `viewport={{ once: true }}`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Each `JobCard` wrapped in `motion.div` with staggered `transition={{ delay: index * 0.1 }}`
- `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- **Edge case:** less than 3 jobs — grid adapts naturally, no visual breakage

### 9. `how-it-works.tsx` (client)

- Section title "How It Works" with subtitle
- 3 cards in `grid-cols-1 sm:grid-cols-3 gap-6`:
  1. "Create Profile" — icon (UserPlusIcon), description
  2. "Browse Jobs" — icon (SearchIcon), description
  3. "Apply & Get Hired" — icon (BriefcaseIcon), description
- Each card: `motion.div` with `whileHover={{ scale: 1.02, y: -4 }}` `whileTap={{ scale: 0.98 }}` — smooth transform/opacity only
- Icon container with `bg-brand/10 text-brand rounded-xl` styling
- **Edge case:** mobile (3 cards stack vertically, full width)

### 10. `testimonials.tsx` (client)

- `useState` for current testimonial index
- 3 hardcoded testimonials (name, role, company, quote, avatar)
- Auto-rotate every 5s via `useEffect` + `setInterval`
- `motion.div` with `AnimatePresence` mode="wait" for slide-in/out transitions
- Pagination dots at bottom (`flex justify-center gap-2`)
- Manual dot click pauses auto-rotation (clear + reset interval)
- **Edge cases:** single testimonial (no rotation), tab blur (pause interval on `document.hidden` via visibility change listener)
- Avatar URLs from `https://i.pravatar.cc/80?u=...`
- Unsplash business-style background

### 11. `footer.tsx` (server)

- Dark background (`bg-neutral-900 text-neutral-300`)
- `grid grid-cols-2 md:grid-cols-4 gap-8` layout
- Columns: Product (Jobs, Pricing, About), Resources (Blog, Guide, FAQ), Company (Careers, Contact, Press), Legal (Privacy, Terms)
- Bottom bar: copyright, social icon links (LinkedIn, Twitter, GitHub) — `ExternalLinkIcon` styled as clickable circles
- **Edge case:** mobile (2 columns, smaller text, reduced padding)

---

## Unsplash Images Used

| Section          | URL                                                                        | Purpose                      |
| ---------------- | -------------------------------------------------------------------------- | ---------------------------- |
| Hero BG          | `https://images.unsplash.com/photo-1521737711867-e3b97375f3f9?w=1200&q=80` | Team workspace, dark overlay |
| Testimonials BG  | `https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80`    | Office meeting room          |
| Avatar fallbacks | `https://i.pravatar.cc/80?u=...`                                           | Testimonial avatars          |

---

## Motion Animation Summary

| Element            | Trigger          | Animation                                |
| ------------------ | ---------------- | ---------------------------------------- |
| Hero text          | Page load        | `fadeIn + slideUp`, staggered 0.2s delay |
| Hero CTA buttons   | Hover            | `scale(1.03)` via `whileHover`           |
| Hero CTA buttons   | Click            | `scale(0.97)` via `whileTap`             |
| Stats numbers      | Scroll into view | Count-up 0→target over 1.5s              |
| Job cards          | Scroll into view | `fadeIn + slideUp`, staggered 0.1s each  |
| How-it-works cards | Hover            | `scale(1.02) + translateY(-4px)`         |
| How-it-works cards | Click            | `scale(0.98)`                            |
| Testimonials       | Auto             | Slide left/out with `AnimatePresence`    |
| All `whileInView`  | —                | `viewport={{ once: true }}` for perf     |

---

## Validation Plan

1. `npx tsc --noEmit` — zero errors
2. `npx eslint` — zero warnings
3. `npm run dev` — landing page renders at `/` with hero image, CTA works
4. Unauthenticated user → landing page visible
5. Authenticated user → redirected to `/user/jobs` (test with logged-in cookie)
6. Mobile responsive (320px viewport) — all sections stack properly
7. Animations play on scroll, respect `prefers-reduced-motion`
8. Featured jobs section works with 0, 1, 2, 3, 6+ jobs
9. Testimonial auto-rotation pauses on tab blur
10. All links navigate to correct routes

---

## Risks & Mitigations

| Risk                                                  | Mitigation                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Unsplash image loads slowly                           | Low-quality placeholder via `?w=400&q=30` + blur-up CSS                                        |
| Session check on every `/` visit                      | Proxy handles it — page.tsx only renders for unauthenticated users                             |
| `whileInView` fires on mobile scroll perf             | `viewport={{ once: true, margin: "-100px" }}` — animates once, off-screen skip                 |
| `prefers-reduced-motion` not respected by motion libs | Explicit `window.matchMedia` check in counter; `motion` respects it natively for `whileInView` |
| Image domain not allowed                              | Already adding `images.unsplash.com` to `remotePatterns` in `next.config.ts`                   |

---

## Execution Order

1. Add `images.unsplash.com` to `next.config.ts` `remotePatterns`
2. Create `app/features/landing/components/` directory and all components (no ordering dependency between them)
3. Modify `app/page.tsx` with `LandingPage` import (no session check needed — proxy.ts handles it)
4. `npx tsc --noEmit` and `npx eslint` — fix issues
