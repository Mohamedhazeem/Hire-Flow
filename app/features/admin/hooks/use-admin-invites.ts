import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

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

type InviteListResponse = {
  invites: AdminInvite[];
  teamMembers: AdminTeamMember[];
};

export function useAdminInvites() {
  return useQuery<InviteListResponse>({
    queryKey: ["admin", "invites"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<InviteListResponse>>("/api/admin/invite");
      return res.data;
    },
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      apiClient(`/api/admin/invite/${inviteId}`, { method: "DELETE" }),
    onMutate: async (inviteId) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["admin", "invites"] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<InviteListResponse>(["admin", "invites"]);

      // Optimistically remove the invite from the list
      if (previous) {
        queryClient.setQueryData<InviteListResponse>(["admin", "invites"], {
          ...previous,
          invites: previous.invites.filter((i) => i.id !== inviteId),
        });
      }

      return { previous };
    },
    onError: (_err, _inviteId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["admin", "invites"], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invites"] });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient(`/api/admin/team/${userId}`, { method: "DELETE" }),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "invites"] });

      const previous = queryClient.getQueryData<InviteListResponse>(["admin", "invites"]);

      if (previous) {
        queryClient.setQueryData<InviteListResponse>(["admin", "invites"], {
          ...previous,
          teamMembers: previous.teamMembers.filter((m) => m.id !== userId),
        });
      }

      return { previous };
    },
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin", "invites"], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invites"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
