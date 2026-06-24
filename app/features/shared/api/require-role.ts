import { getSession } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";

export async function requireRole(allowedRoles: string[]) {
  const session = await getSession();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const role = (session.user as { role?: string }).role;
  if (!role || !allowedRoles.includes(role)) {
    throw new ForbiddenError("Insufficient permissions");
  }

  return session.user;
}
