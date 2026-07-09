import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole, type ResolvedSession } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { NotFoundError, ValidationError } from "@/lib/api/api-error";

type InviteCancelOptions = {
  findInvite: (id: string) => Promise<{ invitedById: string; acceptedAt: Date | null } | null>;
  deleteInvite: (id: string) => Promise<void>;
  ownershipCheck: (invite: { invitedById: string }, session: ResolvedSession) => void;
};

export function createInviteCancelHandler(allowedRoles: string[], options: InviteCancelOptions) {
  const { findInvite, deleteInvite, ownershipCheck } = options;

  async function handleDELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const session = await requireRole(allowedRoles);
    const { id } = await params;

    const invite = await findInvite(id);

    if (!invite) {
      throw new NotFoundError("Invite not found");
    }

    if (invite.acceptedAt) {
      throw new ValidationError("Cannot cancel an already accepted invite");
    }

    ownershipCheck(invite, session);

    await deleteInvite(id);

    return ok({ cancelled: true });
  }

  return {
    DELETE: withErrorHandler(handleDELETE),
  };
}
