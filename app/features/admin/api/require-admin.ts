import { getSession } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const role = RoleSchema.safeParse((session.user as { role?: string }).role);
  if (!role.success || (role.data !== "admin" && role.data !== "super_admin")) {
    throw new ForbiddenError();
  }

  return session.user;
}
