"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ApiEnvelope } from "@/lib/api-response";

export type ThreadUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};

export type ThreadLastMessage = {
  content: string;
  createdAt: string;
  senderId: string;
  unread: boolean;
};

export type ThreadItem = {
  threadId: string;
  user: ThreadUser;
  lastMessage: ThreadLastMessage | null;
};

export function useRecruiterThreads() {
  return useQuery<ThreadItem[]>({
    queryKey: ["recruiter", "threads"],
    queryFn: async () => {
      const res = await apiClient<ApiEnvelope<ThreadItem[]>>("/api/recruiter/threads");
      return res.data;
    },
    refetchInterval: 60_000,
  });
}

export function useInvalidateRecruiterThreads() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["recruiter", "threads"] });
}
