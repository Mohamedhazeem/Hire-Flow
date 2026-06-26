import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api-error";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const { id } = await params;

  if (session.memberRole !== "owner") {
    throw new ForbiddenError("Only the company owner can remove team members");
  }

  if (id === session.id) {
    throw new ValidationError("You cannot remove yourself from the team");
  }

  const member = await prisma.companyTeamMember.findUnique({
    where: { id },
    select: { id: true, userId: true, role: true },
  });

  if (!member) {
    throw new NotFoundError("Team member not found");
  }

  const company = await prisma.company.findUniqueOrThrow({
    where: { recruiterId: session.id },
    select: { id: true },
  });

  if (member.userId === session.id) {
    throw new ValidationError("You cannot remove yourself from the team");
  }

  const companyMembers = await prisma.companyTeamMember.findFirst({
    where: { companyId: company.id, id: member.id },
  });

  if (!companyMembers) {
    throw new NotFoundError("Team member not found in your company");
  }

  await prisma.companyTeamMember.delete({
    where: { id },
  });

  return ok({ removed: true });
}

export const DELETE = withErrorHandler(handleDELETE);
