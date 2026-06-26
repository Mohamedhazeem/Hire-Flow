import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

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

type InviteListResponse = {
  invites: RecruiterInvite[];
  teamMembers: RecruiterTeamMember[];
};

export function useRecruiterInvites() {
  return useQuery<InviteListResponse>({
    queryKey: ["recruiter", "invites"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<InviteListResponse>>("/api/recruiter/invite");
      return res.data;
    },
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      apiClient(`/api/recruiter/invite/${inviteId}`, { method: "DELETE" }),
    onMutate: async (inviteId) => {
      await queryClient.cancelQueries({ queryKey: ["recruiter", "invites"] });

      const previous = queryClient.getQueryData<InviteListResponse>(["recruiter", "invites"]);

      if (previous) {
        queryClient.setQueryData<InviteListResponse>(["recruiter", "invites"], {
          ...previous,
          invites: previous.invites.filter((i) => i.id !== inviteId),
        });
      }

      return { previous };
    },
    onError: (_err, _inviteId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["recruiter", "invites"], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "invites"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      apiClient(`/api/recruiter/team/${memberId}`, { method: "DELETE" }),
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: ["recruiter", "invites"] });

      const previous = queryClient.getQueryData<InviteListResponse>(["recruiter", "invites"]);

      if (previous) {
        queryClient.setQueryData<InviteListResponse>(["recruiter", "invites"], {
          ...previous,
          teamMembers: previous.teamMembers.filter((m) => m.id !== memberId),
        });
      }

      return { previous };
    },
    onError: (_err, _memberId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["recruiter", "invites"], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "invites"] });
    },
  });
}
