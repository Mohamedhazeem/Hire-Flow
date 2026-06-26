import { auth } from "@/app/features/auth/libs/auth";
import ErrorPage from "@/components/shared/error-page";
import { headers } from "next/headers";

export default async function UnauthorizedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = session?.user ? (session.user as { role: string }).role : undefined;

  let dashboardPath = "/login";
  if (userRole === "admin") dashboardPath = "/admin";
  else if (userRole === "recruiter") dashboardPath = "/recruiter";
  else if (userRole === "user") dashboardPath = "/user";

  return (
    <ErrorPage
      errorTag="Access denied"
      title="403 — Unauthorized"
      description="You don't have permission to view this page. Please return to your dashboard or
            sign in with an account that has the required access."
      path={dashboardPath}
      session={session ? true : false}
    />
  );
}
