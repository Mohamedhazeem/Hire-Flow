import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/api/api-error";

export const inviteService = {
  async acceptAdminInvite(token: string) {
    const invite = await prisma.adminInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.acceptedAt) {
      throw new NotFoundError("Invalid or expired invitation token");
    }

    const existingAdminCount = await prisma.user.count({
      where: { role: { in: ["admin", "super_admin"] } },
    });

    const newRole = existingAdminCount === 0 ? "super_admin" : "admin";

    await prisma.$transaction([
      prisma.user.update({
        where: { email: invite.email },
        data: { role: newRole },
      }),
      prisma.adminInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return { accepted: true, role: newRole };
  },

  async acceptRecruiterInvite(token: string) {
    const invite = await prisma.recruiterInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.acceptedAt) {
      throw new NotFoundError("Invalid or expired invitation token");
    }

    const user = await prisma.user.findUnique({
      where: { email: invite.email },
      select: { id: true },
    });

    if (!user) {
      return { accepted: false, error: "No account found with this email. Please sign up first." };
    }

    const existingMembership = await prisma.companyTeamMember.findUnique({
      where: { userId: user.id },
    });

    if (existingMembership) {
      throw new NotFoundError("You are already a member of a company team");
    }

    await prisma.$transaction([
      prisma.companyTeamMember.create({
        data: {
          companyId: invite.companyId,
          userId: user.id,
          role: "member",
        },
      }),
      prisma.recruiterInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return { accepted: true };
  },
};
