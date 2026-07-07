"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";

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

export function createUseThreads(queryKey: string, apiBasePath: string) {
  return () => useQuery<ThreadItem[]>({
    queryKey: [queryKey, "threads"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ThreadItem[]>>(
        `${apiBasePath}/threads`,
      );
      return res.data;
    },
    refetchInterval: 60_000,
  });
}

export function createUseInvalidateThreads(queryKey: string) {
  return () => {
    const queryClient = useQueryClient();
    return () =>
      queryClient.invalidateQueries({ queryKey: [queryKey, "threads"] });
  };
}
