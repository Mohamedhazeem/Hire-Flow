import prisma from "@/lib/prisma";

export type AdminInviteRow = {
  id: string;
  email: string;
  invitedBy: { name: string | null; email: string };
  createdAt: Date;
  acceptedAt: Date | null;
};

export type AdminTeamMemberRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
};

export type AdminInviteListResponse = {
  invites: AdminInviteRow[];
  teamMembers: AdminTeamMemberRow[];
};

export async function listAdminInvites(): Promise<AdminInviteListResponse> {
  const [invites, teamMembers] = await Promise.all([
    prisma.adminInvite.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["admin", "super_admin"] } },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { invites, teamMembers };
}
