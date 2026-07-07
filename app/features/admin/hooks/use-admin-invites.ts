import { createInviteHooks } from "@/app/features/shared/hooks/use-invites";

export type AdminInvite = {
  id: string;
  email: string;
  invitedBy: { name: string | null; email: string };
  createdAt: string;
  acceptedAt: string | null;
};

export type AdminTeamMember = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

const hooks = createInviteHooks<AdminTeamMember>("admin", "/api/admin", [
  ["admin", "users"],
]);

export const useAdminInvites = hooks.useInvites;
export const useCancelInvite = hooks.useCancelInvite;
export const useRemoveAdmin = hooks.useRemoveMember;
