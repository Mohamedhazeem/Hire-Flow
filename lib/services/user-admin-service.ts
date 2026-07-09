import { prisma } from "@/lib/prisma";
import { auth } from "@/app/features/auth/libs/auth";
import { sendEmail } from "@/app/features/auth/libs/email";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/api/api-error";
import { RoleSchema } from "@/app/features/auth/schema/role.schema";

export const userAdminService = {
  async banUser(adminId: string, targetId: string, banReason?: string, banExpiresIn?: number) {
    if (adminId === targetId) {
      throw new ValidationError("You cannot ban yourself");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { email: true, name: true },
    });

    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.update({
      where: { id: targetId },
      data: {
        banned: true,
        banReason: banReason ?? "No reason",
        banExpiresAt: banExpiresIn ? new Date(Date.now() + banExpiresIn * 1000) : null,
      },
    });

    await prisma.session.deleteMany({
      where: { userId: targetId },
    });

    const expiresInDays = banExpiresIn ? Math.ceil(banExpiresIn / 86400) : undefined;

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { name: true, email: true },
    });

    await sendEmail({
      to: targetUser.email,
      subject: "Your HireFlow account has been suspended",
      type: "ban-notification",
      invitedByName: admin?.name ?? adminId,
      banDetails: {
        reason: banReason,
        expiresInDays,
      },
    });

    return { banned: true };
  },

  async unbanUser(targetId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, banned: true },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { banned: false, banReason: null, banExpiresAt: null },
    });

    return { unbanned: true };
  },

  async setRole(targetId: string, role: string, headers: Headers) {
    const validated = RoleSchema.safeParse(role);

    if (!validated.success) {
      throw new ValidationError("Invalid role");
    }

    await auth.api.adminUpdateUser({
      body: { userId: targetId, data: { role: validated.data } },
      headers,
    });

    return { roleSet: validated.data };
  },

  async removeAdminMember(memberId: string, adminId: string) {
    if (memberId === adminId) {
      throw new ValidationError("You cannot remove yourself from the admin team");
    }

    const user = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new NotFoundError("Admin not found");
    }

    if (user.role === "super_admin") {
      throw new ForbiddenError("Cannot remove another super admin");
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { role: "user" },
    });

    return { removed: true };
  },

  async removeRecruiterMember(memberId: string, recruiterId: string, memberRole?: string) {
    if (memberRole !== "owner") {
      throw new ForbiddenError("Only the company owner can remove team members");
    }

    if (memberId === recruiterId) {
      throw new ValidationError("You cannot remove yourself from the team");
    }

    const member = await prisma.companyTeamMember.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true, role: true },
    });

    if (!member) {
      throw new NotFoundError("Team member not found");
    }

    const company = await prisma.company.findUniqueOrThrow({
      where: { recruiterId },
      select: { id: true },
    });

    if (member.userId === recruiterId) {
      throw new ValidationError("You cannot remove yourself from the team");
    }

    const companyMembers = await prisma.companyTeamMember.findFirst({
      where: { companyId: company.id, id: member.id },
    });

    if (!companyMembers) {
      throw new NotFoundError("Team member not found in your company");
    }

    await prisma.companyTeamMember.delete({
      where: { id: memberId },
    });

    return { removed: true };
  },
};
