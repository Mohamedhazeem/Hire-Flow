import prisma from "@/lib/prisma";

export type RecruiterInviteRow = {
  id: string;
  email: string;
  invitedBy: { name: string | null; email: string };
  createdAt: Date;
  acceptedAt: Date | null;
};

export type RecruiterTeamMemberRow = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
  createdAt: Date;
};

export type RecruiterInviteListResponse = {
  invites: RecruiterInviteRow[];
  teamMembers: RecruiterTeamMemberRow[];
};

export async function listRecruiterInvites(
  companyId: string,
): Promise<RecruiterInviteListResponse> {
  const [invites, teamMembers] = await Promise.all([
    prisma.recruiterInvite.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.companyTeamMember.findMany({
      where: { companyId },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, name: true, email: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { invites, teamMembers };
}
