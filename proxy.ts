import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/features/auth/libs/auth";
import { getRedirectPath } from "./app/features/auth/utils/getRedirectPath";

const authPages = ["/login", "/register", "/reset-password", "/verify-email"];
const protectedRoutes = ["/admin", "/recruiter", "/user"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const isAuthPage = authPages.includes(pathname);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // 1. SIGNED-IN USERS: Redirect if they touch auth pages OR the generic /dashboard root
  if (session && (isAuthPage || pathname === "/") && pathname !== "/verify-email") {
    const redirectPath = getRedirectPath(session.user);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  // 2. UNAUTHENTICATED USERS: Redirect if they touch protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
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
  ],
};
