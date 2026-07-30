import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/api/api-error";
import { createInviteCancelHandler } from "@/lib/handlers/invite";

export const { DELETE } = createInviteCancelHandler(
  ["recruiter"],
  {
    findInvite: (id) => prisma.recruiterInvite.findUnique({ where: { id } }),
    deleteInvite: (id) => prisma.recruiterInvite.delete({ where: { id } }).then(() => undefined),
    ownershipCheck: (invite, session) => {
      if (invite.invitedById !== session.id && session.memberRole !== "owner") {
        throw new ValidationError("You can only cancel your own invites");
      }
    },
  },
  "recruiter:invite:manage",
);
