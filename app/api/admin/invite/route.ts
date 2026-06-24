import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET() {
  await requireRole(["admin", "super_admin"]);

  const [invites, teamMembers] = await Promise.all([
    prisma.adminInvite.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return ok({ invites, teamMembers });
}

export const GET = withErrorHandler(handleGET);
