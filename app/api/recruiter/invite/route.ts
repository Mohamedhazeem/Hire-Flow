import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { listRecruiterInvites } from "@/app/features/recruiter/queries/invite-queries";

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

  const data = await listRecruiterInvites(companyId);
  return ok(data);
}

export const GET = withErrorHandler(handleGET);
