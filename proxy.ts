import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/features/auth/libs/auth";
import { getRedirectPath } from "./app/features/auth/utils/getRedirectPath";
import { RoleSchema } from "./app/features/auth/schema/role.schema";
import { AUTH_PAGES, PROTECTED_ROUTES } from "./lib/routes";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const isAuthPage = AUTH_PAGES.includes(pathname as (typeof AUTH_PAGES)[number]);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // 1. SIGNED-IN USERS: Redirect if they touch auth pages OR the generic root
  if (session && (isAuthPage || pathname === "/") && pathname !== "/verify-email") {
    const redirectPath = getRedirectPath(session.user);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  // 2. UNAUTHENTICATED USERS: Redirect if they touch protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. ADMIN ROLE ENFORCEMENT: Non-admin users redirected from /admin routes
  if (session && isAdminRoute) {
    const role = RoleSchema.safeParse((session.user as { role?: string }).role);
    if (!role.success || (role.data !== "admin" && role.data !== "super_admin")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/recruiter/:path*",
    "/user/:path*",
    "/login",
    "/register",
    "/reset-password",
    "/verify-email",
    "/become-employer",
  ],
};
