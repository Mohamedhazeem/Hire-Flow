import { getSession } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";

export async function requireSuperAdmin() {
  const session = await getSession();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "super_admin") {
    throw new ForbiddenError("Only super admins can perform this action");
  }

  return session.user;
}
