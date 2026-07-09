import { getSession } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/api-error";
import { prisma } from "@/lib/prisma";

export type ResolvedSession = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
  memberRole?: string;
};

export async function requireRole(allowedRoles: string[]): Promise<ResolvedSession> {
  const session = await getSession();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const user = session.user as { id: string; name: string; email: string; role?: string };
  const role = user.role ?? "";
  const base: ResolvedSession = { ...user, role };

  if (allowedRoles.includes(role)) {
    if (role === "recruiter") {
      const membership = await prisma.companyTeamMember.findUnique({
        where: { userId: user.id },
        select: { companyId: true, role: true },
      });
      if (membership) {
        base.companyId = membership.companyId;
        base.memberRole = membership.role;
      }
    }
    return base;
  }

  if (allowedRoles.includes("recruiter")) {
    const membership = await prisma.companyTeamMember.findUnique({
      where: { userId: user.id },
      select: { companyId: true, role: true },
    });

    if (membership) {
      return { ...base, companyId: membership.companyId, memberRole: membership.role };
    }
  }

  throw new ForbiddenError("Insufficient permissions");
}
