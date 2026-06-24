import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError, ValidationError } from "@/lib/api-error";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const invite = await prisma.adminInvite.findUnique({ where: { id } });

  if (!invite) {
    throw new NotFoundError("Invite not found");
  }

  if (invite.acceptedAt) {
    throw new ValidationError("Cannot cancel an already accepted invite");
  }

  await prisma.adminInvite.delete({ where: { id } });

  return ok({ cancelled: true });
}

export const DELETE = withErrorHandler(handleDELETE);
