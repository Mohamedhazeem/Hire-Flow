import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

export type InviteListItem = {
  id: string;
  email: string;
  invitedBy: { name: string | null; email: string };
  createdAt: string;
  acceptedAt: string | null;
};

export function createInviteHooks<TTeamMember extends { id: string }>(
  queryKeyBase: string,
  apiBase: string,
  extraInvalidations?: string[][],
) {
  type InviteListResponse = {
    invites: InviteListItem[];
    teamMembers: TTeamMember[];
  };

  function useInvites() {
    return useQuery<InviteListResponse>({
      queryKey: [queryKeyBase, "invites"],
      queryFn: async () => {
        const res = await apiClient<ApiResponse<InviteListResponse>>(`${apiBase}/invite`);
        return res.data;
      },
    });
  }

  function useCancelInvite() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (inviteId: string) =>
        apiClient(`${apiBase}/invite/${inviteId}`, { method: "DELETE" }),
      onMutate: async (inviteId) => {
        await queryClient.cancelQueries({ queryKey: [queryKeyBase, "invites"] });

        const previous = queryClient.getQueryData<InviteListResponse>([queryKeyBase, "invites"]);

        if (previous) {
          queryClient.setQueryData<InviteListResponse>([queryKeyBase, "invites"], {
            ...previous,
            invites: previous.invites.filter((i) => i.id !== inviteId),
          });
        }

        return { previous };
      },
      onError: (_err, _inviteId, context) => {
        if (context?.previous) {
          queryClient.setQueryData([queryKeyBase, "invites"], context.previous);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeyBase, "invites"] });
      },
    });
  }

  function useRemoveMember() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (memberId: string) =>
        apiClient(`${apiBase}/team/${memberId}`, { method: "DELETE" }),
      onMutate: async (memberId) => {
        await queryClient.cancelQueries({ queryKey: [queryKeyBase, "invites"] });

        const previous = queryClient.getQueryData<InviteListResponse>([queryKeyBase, "invites"]);

        if (previous) {
          queryClient.setQueryData<InviteListResponse>([queryKeyBase, "invites"], {
            ...previous,
            teamMembers: previous.teamMembers.filter((m) => m.id !== memberId),
          });
        }

        return { previous };
      },
      onError: (_err, _memberId, context) => {
        if (context?.previous) {
          queryClient.setQueryData([queryKeyBase, "invites"], context.previous);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeyBase, "invites"] });
        if (extraInvalidations) {
          for (const key of extraInvalidations) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        }
      },
    });
  }

  return { useInvites, useCancelInvite, useRemoveMember };
}
