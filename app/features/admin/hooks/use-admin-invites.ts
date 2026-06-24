import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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
  createdAt: string;
};

type InviteListResponse = {
  invites: AdminInvite[];
  teamMembers: AdminTeamMember[];
};

export function useAdminInvites() {
  return useQuery<InviteListResponse>({
    queryKey: ["admin", "invites"],
    queryFn: () => apiClient("/api/admin/invite"),
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      apiClient(`/api/admin/invite/${inviteId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invites"] });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/api/admin/team/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invites"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
