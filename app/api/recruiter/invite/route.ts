import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET() {
  const session = await requireRole(["recruiter"]);

  const companyId =
    session.companyId ??
    (
      await prisma.company.findUniqueOrThrow({
        where: { recruiterId: session.id },
        select: { id: true },
      })
    ).id;

  const [invites, teamMembers] = await Promise.all([
    prisma.recruiterInvite.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.companyTeamMember.findMany({
      where: { companyId },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, name: true, email: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return ok({ invites, teamMembers });
}

export const GET = withErrorHandler(handleGET);
