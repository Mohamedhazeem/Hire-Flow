/**
 * Shared route constants used by the middleware proxy and the PublicNavbar.
 * Single source of truth — never duplicate these lists.
 */
export const AUTH_PAGES = ["/login", "/register", "/reset-password", "/verify-email"] as const;

export const PROTECTED_ROUTES = ["/admin", "/recruiter", "/user"] as const;

export const ADDITIONAL_HIDDEN_PREFIXES = ["/admin-invite", "/recruiter-invite"] as const;

export const PUBLIC_CONTENT_PATHS = ["/", "/jobs", "/resources", "/unauthorized"] as const;

/** All prefix-based route patterns where the navbar is hidden */
const HIDDEN_ROUTE_PREFIXES = [
  ...PROTECTED_ROUTES,
  ...AUTH_PAGES,
  ...ADDITIONAL_HIDDEN_PREFIXES,
] as const;

/**
 * Returns true if the PublicNavbar should NOT render for the given pathname.
 *
 * Navbar shows on:
 *   - Exact matches: "/", "/jobs", "/unauthorized"
 *   - Prefix matches: "/jobs/*" (e.g. /jobs/123)
 *
 * Navbar hides on:
 *   - All auth pages (/login, /register, /reset-password, /verify-email)
 *   - All dashboard prefixes (/admin/*, /recruiter/*, /user/*)
 *   - Invite pages (/admin-invite/*, /recruiter-invite/*)
 *   - Any route not listed as a public content path
 */
export function isHiddenRoute(pathname: string): boolean {
  // Allow exact public content paths
  if (PUBLIC_CONTENT_PATHS.includes(pathname as typeof PUBLIC_CONTENT_PATHS[number])) {
    return false;
  }

  // Allow /jobs/* sub-routes
  if (pathname.startsWith("/jobs/")) {
    return false;
  }

  // Hidden if it matches any hidden prefix
  return HIDDEN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
