import { getSession } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/api-error";
import { prisma } from "@/lib/prisma";
import { getSessionCache } from "@/lib/rate-limiting/request-context";

export type ResolvedSession = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
  memberRole?: string;
};

export async function requireRole(allowedRoles: string[]): Promise<ResolvedSession> {
  const cached = getSessionCache();
  if (cached?.session) {
    const { session } = cached;
    if (allowedRoles.includes(session.role)) {
      return session as ResolvedSession;
    }
    if (allowedRoles.includes("recruiter") && session.memberRole) {
      return session as ResolvedSession;
    }
    throw new ForbiddenError("Insufficient permissions");
  }

  const authSession = await getSession();

  if (!authSession?.user) {
    throw new UnauthorizedError();
  }

  const user = authSession.user as { id: string; name: string; email: string; role?: string };
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
