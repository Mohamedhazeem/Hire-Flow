"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";

export type UserThreadUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};

export type UserThreadLastMessage = {
  content: string;
  createdAt: string;
  senderId: string;
  unread: boolean;
};

export type UserThreadItem = {
  threadId: string;
  user: UserThreadUser;
  lastMessage: UserThreadLastMessage | null;
};

export function useUserThreads() {
  return useQuery<UserThreadItem[]>({
    queryKey: ["user", "threads"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<UserThreadItem[]>>(
        "/api/recruiter/threads",
      );
      return res.data;
    },
    refetchInterval: 60_000,
  });
}

export function useInvalidateUserThreads() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["user", "threads"] });
}
