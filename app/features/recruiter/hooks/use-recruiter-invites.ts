import { createInviteHooks } from "@/app/features/shared/hooks/use-invites";

export type RecruiterInvite = {
  id: string;
  email: string;
  invitedBy: { name: string | null; email: string };
  createdAt: string;
  acceptedAt: string | null;
};

export type RecruiterTeamMember = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
  createdAt: string;
};

const hooks = createInviteHooks<RecruiterTeamMember>("recruiter", "/api/recruiter");

export const useRecruiterInvites = hooks.useInvites;
export const useCancelInvite = hooks.useCancelInvite;
export const useRemoveMember = hooks.useRemoveMember;
