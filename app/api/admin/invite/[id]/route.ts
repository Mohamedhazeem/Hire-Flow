import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/api-error";
import { createInviteCancelHandler } from "@/lib/handlers/invite";

export const { DELETE } = createInviteCancelHandler(["admin", "super_admin"], {
  findInvite: (id) => prisma.adminInvite.findUnique({ where: { id } }),
  deleteInvite: (id) => prisma.adminInvite.delete({ where: { id } }).then(() => undefined),
  ownershipCheck: (invite, session) => {
    if (session.role !== "super_admin" && invite.invitedById !== session.id) {
      throw new ForbiddenError("You can only cancel your own invites");
    }
  },
});
