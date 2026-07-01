# Step 4.3 — Auth-Aware Navbar, Redirect Logic & Account Popover

## Context

The app has no public navbar — landing page, job listing, and job detail pages have zero top navigation.
Authentication uses **better-auth** with server-side `getSession()` and client-side `useSession()`.
Role layouts (`admin`, `recruiter`, `user`) each have their own sidebar with user info and sign-out button,
but no shared pattern exists — sign-out code is duplicated 5× and redirect params are inconsistent (`returnUrl` vs `redirect`).
The `login-action` currently ignores `returnUrl`, making the `SaveJobButton` and job-detail "Log in to Apply" returnUrl flow **broken**.

---

## Edge Case Inventory

| # | Edge Case | Handling |
|---|-----------|----------|
| 1 | User is already authenticated on landing page | Navbar shows avatar + "Dashboard" link, not "Login"/"Sign Up" |
| 2 | User navigates to `/jobs` already authenticated | Same as above — navbar is per-route-group aware |
| 3 | User on `/login` or `/register` — should no navbar show? | Correct — auth pages have no navbar. `usePathname()` excludes them |
| 4 | Mobile viewport (<768px) | Navbar compresses to logo + hamburger; hamburger opens animated slide-down with nav links + user area |
| 5 | User clicks Sign Out from popover | `useSignOut` hook calls `signOut()` → on success redirects to `/` (landing) |
| 6 | User clicks "Dashboard" from popover | Redirects to role-based dashboard (`/admin`, `/recruiter`, `/user`) |
| 7 | User has no `image` (no avatar set) | Avatar fallback: initials from `name` (2 chars, uppercase) in a colored circle |
| 8 | Network error on sign-out | `catch(() => {})` inside `useSignOut` → no crash, user can retry |
| 9 | `getServerSession` returns null (edge: DB down) | Navbar renders unauthenticated state (Login/Sign Up buttons) |
| 10 | `returnUrl` is an absolute URL (open redirect) | `login-action` validates `returnUrl` starts with `/` only; rejects absolute URLs |
| 11 | `returnUrl` is `//evil.com` (protocol-relative bypass) | The check `returnUrl.startsWith("/") && !returnUrl.startsWith("//")` catches this |
| 12 | `returnUrl` points to `/admin` but user is not admin | Role layout's `checkRole()` handles this — redirects to `/unauthorized`. No special handling in navbar. |
| 13 | User signs out, then presses browser Back | Session cookie is cleared; server renders unauthenticated state. No stale cache issues because navbar uses server-side session for initial state. |
| 14 | User is on `/jobs/[id]` (job detail), signs out | Signs out → redirect to `/` (landing). No returnUrl needed after sign-out. |
| 15 | Popover positioned near edge of screen | `side="bottom"`, `align="end"` with fallback. Shadcn popover handles auto-flip. |
| 16 | Multiple tabs — user signs out in one tab | Second tab's navbar still shows authenticated state until next navigation. This is acceptable — better-auth uses cookies, next request refresh. |
| 17 | Hamburger menu open → user resizes to desktop | On resize, the menu closes naturally (CSS responsive breakpoint hides the mobile menu). |
| 18 | Theme toggle inside popover | Included inside `AccountPopover` so user can toggle theme without navigating to dashboard. |
| 19 | Role not recognized (e.g. `unknown` role) | Falls back to "User" for display; dashboard link goes to `/user`. |
| 20 | User has very long name | Avatar initials truncate to 2 chars; name in popover is `truncate` with `title` attribute for full name on hover. |

---

## Architecture Decisions

### Server/Client Split for Navbar

**Decision**: Client component with `useSession()` and `usePathname()`.

The navbar needs `usePathname()` for route-aware rendering and `useSession()` for auth state.
A server-component shell with a tiny client boundary was considered but rejected because:
1. `usePathname()` is client-only — we'd need the client boundary anyway
2. The popover is inherently interactive (open/close, sign-out, theme toggle)
3. A single `'use client'` component avoids the extra server-render → client-hydration overhead

### How Role Layouts Suppress the Public Navbar

The root layout's `<PublicNavbar />` uses `usePathname()` and checks the path against a public-route set:
- Returns `null` for `/admin/*`, `/recruiter/*`, `/user/*`, `/login`, `/register`, `/verify-email`, `/reset-password`, `/admin-invite`, `/recruiter-invite`
- Renders navbar for `/`, `/jobs`, `/jobs/*`, `/unauthorized`

### ReturnUrl Fix

`login-action` is modified to accept an optional `returnUrl` field (validated server-side).
`getRedirectPath` gains an optional `returnUrl` parameter — if present and safe, redirects there instead.
`SaveJobButton` and `job-detail-view.tsx` already pass `returnUrl` — they just work after this fix.

### Existing Popover Component

Uses `@base-ui/react/popover` already installed at `components/ui/popover.tsx`.
No drop-down-menu or avatar components exist — they are built inline into `AccountPopover`.

---

## Files to Create

### 1. `app/features/public/hooks/use-sign-out.ts` (~12 lines)

Shared sign-out hook to eliminate the 5× duplicated pattern.

```ts
"use client";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/features/auth/libs/auth-client";

export function useSignOut() {
  const router = useRouter();
  return async () => {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  };
}
```

### 2. `components/shared/avatar-fallback.tsx` (~25 lines)

Reusable avatar-with-initials component (reused by AccountPopover, sidebar already has its own inline version).

```tsx
"use client";
import Image from "next/image";

type Props = { name: string; image?: string | null; size?: number; className?: string };

export function AvatarFallback({ name, image, size = 36, className }: Props) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
```

### 3. `app/features/public/components/account-popover.tsx` (~110 lines)

The popover content shown when clicking the user avatar. Uses existing `Popover` primitive.

**Content**: Avatar (48px) + name + email + role badge | divider | "Go to Dashboard" (icon) | ThemeToggle | divider | "Sign Out" (icon).

Edge cases handled:
- No avatar → initials fallback (via `AvatarFallback`)
- Long name → `truncate` + `title` attribute
- Unknown role → "User" badge
- Theme toggle stays within popover

Mobile: same content, positioned with `side="bottom" align="end"`.

```tsx
"use client";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";
import { AvatarFallback } from "@/components/shared/avatar-fallback";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getRedirectPath } from "@/app/features/auth/utils/getRedirectPath";
import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";
```

### 4. `app/features/public/components/public-navbar.tsx` (~150 lines)

The main navbar. Client component. Uses `usePathname()` for route-aware rendering and `useSession()` for auth state.

**Structure**:
- Desktop: Logo (left) → nav links (Browse Jobs) → ThemeToggle → User avatar with popover (right)
  - Unauthenticated: Login / Sign Up buttons instead of avatar
- Mobile (<lg): Logo (left) → hamburger (right)
  - Hamburger opens an animated slide-down (`motion.div` with `AnimatePresence`):
    - Nav links
    - Divider
    - If authenticated: avatar + name + role | Dashboard link | Sign Out
    - If unauthenticated: Login / Sign Up buttons
    - ThemeToggle at bottom

**Route awareness**:
- Renders navbar for: `/`, `/jobs`, `/jobs/*`, `/unauthorized`
- Returns `null` for: `/admin/*`, `/recruiter/*`, `/user/*`, `/login`, `/register`, `/verify-email`, `/reset-password`, `/admin-invite`, `/recruiter-invite`

**Mobile menu state**: `useState<boolean>`, reset on pathname change via `useEffect`.

**Animation**: `motion.div` slide-down from top, `y: -20 → 0`, opacity `0 → 1`, duration 0.2s. `AnimatePresence` for exit.

All nav links use `Link` from `next/link` for SPA navigation that auto-closes the mobile menu on click.

### 5. `app/features/public/components/public-navbar-skeleton.tsx` (~15 lines)

Loading skeleton for the navbar shown during initial session hydration:

```tsx
export function PublicNavbarSkeleton() {
  return (
    <div className="sticky top-0 z-50 bg-bg-base border-b border-border-subtle">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="h-5 w-24 bg-bg-muted rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
```

---

## Files to Modify

### 1. `app/layout.tsx` — add PublicNavbar

Add `<Suspense fallback={<PublicNavbarSkeleton />}><PublicNavbar /></Suspense>` at the top of the body,
wrapping children in a `<main>` that has `flex-1` so the navbar + content stack vertically.

Reference structure:
```tsx
<body className="min-h-full flex flex-col">
  <Providers>
    <Suspense fallback={<PublicNavbarSkeleton />}>
      <PublicNavbar />
    </Suspense>
    {children}
  </Providers>
</body>
```

### 2. `app/features/auth/actions/login-action.ts` — accept returnUrl

- Extend `SignInSchema` with optional `returnUrl` field (Zod `z.string().optional()`)
- After successful sign-in, call `getRedirectPath(user, returnUrl)` instead of `getRedirectPath(user)`
- Server-side validation: `returnUrl` must be a relative path (starts with `/`, not `//`)

### 3. `app/features/auth/utils/getRedirectPath.ts` — support returnUrl

Add optional `returnUrl` parameter:
```ts
export function getRedirectPath(response: User | UserCredentials, returnUrl?: string): AuthRedirectTargetType {
  if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
    return returnUrl as AuthRedirectTargetType;
  }
  // ...existing role-based logic...
}
```

### 4. `app/features/auth/components/login-form.tsx` — read returnUrl from searchParams

Add `useSearchParams()` to read `returnUrl` query param and pass it to `loginAction`:
```tsx
const sp = useSearchParams();
const returnUrl = sp.get("returnUrl") ?? undefined;
// In onSubmit: pass returnUrl to loginAction
const result = await loginAction({ ...data, returnUrl });
```

### 5. Refactor existing duplicate signOut patterns

Update `admin-sidebar.tsx`, `recruiter-sidebar.tsx`, `user-sidebar.tsx`, and `logout-button.tsx` to use the shared `useSignOut()` hook.

---

## Validation Plan

1. **TypeScript**: `npx tsc --noEmit` — zero errors
2. **ESLint**: `npx eslint` on changed files — zero warnings
3. **Desktop navbar**: Logo + nav links + avatar (or Login/Sign Up) render correctly
4. **Mobile navbar**: Logo + hamburger; hamburger opens slide-down with all items
5. **Unauthenticated state**: Shows Login/Sign Up, no avatar
6. **Authenticated state**: Shows avatar, clicking opens popover with name/email/role/dashboard/sign-out
7. **Sign-out**: Clears session, redirects to `/`
8. **returnUrl flow**: Click "Log in to Apply" on job detail → login → redirected back to job detail
9. **returnUrl with absolute URL**: Rejected, falls back to dashboard
10. **Mobile → desktop resize**: No layout shift, menu auto-closes
11. **Role dashboard pages**: Navbar is absent, sidebar remains
12. **Auth pages**: Navbar is absent
13. **All components ≤150 lines**: Measured after writing
14. **`app/page.tsx` and landing components unchanged**: Navbar is in root layout, landing page doesn't change

---

## Open Questions (resolved)

- **Server vs Client navbar?** → Client component (needs `usePathname()` + `useSession()`)
- **Where does navbar live?** → Root `app/layout.tsx`, route-aware via `usePathname()`
- **returnUrl fix in scope?** → Yes, fixes broken flow in existing components
- **Account popover on dashboard too?** → No, public pages only. Dashboard has sidebar.
- **Routes without navbar?** → Auth pages (`/login`, `/register`, etc.) + role dashboard pages
