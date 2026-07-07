"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";
import { isValidThreadId } from "@/lib/thread-utils";
import type { MessageItem } from "@/components/chat/message-item";

export type { MessageItem };

type MessagesResponse = {
  messages: MessageItem[];
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
};

export type SendMessagePayload = {
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
};

export function createUseMessages(queryKey: string, apiBasePath: string) {
  return (threadId: string) => useInfiniteQuery<ApiResponse<MessagesResponse>>({
    queryKey: [queryKey, "messages", threadId],
    refetchInterval: 60_000,
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      const params: Record<string, unknown> = { limit: 30 };
      if (cursor) params.cursor = cursor;
      return apiClient<ApiResponse<MessagesResponse>>(
        `${apiBasePath}/messages/${threadId}`,
        { params },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.hasNextPage
        ? lastPage.data.meta.nextCursor
        : undefined,
    enabled: isValidThreadId(threadId),
  });
}

export function createUseSendMessage(queryKey: string, apiBasePath: string) {
  return (threadId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (payload: SendMessagePayload) =>
        apiClient(`${apiBasePath}/messages/${threadId}`, {
          method: "POST",
          body: payload,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKey, "messages", threadId],
        });
        queryClient.invalidateQueries({ queryKey: [queryKey, "threads"] });
      },
    });
  };
}

export function createUseDeleteMessage(queryKey: string, apiBasePath: string) {
  return (threadId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (messageId: string) =>
        apiClient(`${apiBasePath}/messages/${threadId}/${messageId}`, {
          method: "DELETE",
        }),
      onSuccess: (_, messageId) => {
        queryClient.setQueryData(
          [queryKey, "messages", threadId],
          (old: unknown) => {
            const data = old as
              | { pages: { data: { messages: { id: string }[] } }[] }
              | undefined;
            if (!data?.pages) return old;
            return {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  messages: page.data.messages.filter(
                    (m: { id: string }) => m.id !== messageId,
                  ),
                },
              })),
            };
          },
        );
        queryClient.invalidateQueries({
          queryKey: [queryKey, "messages", threadId],
        });
      },
    });
  };
}

export function createUseDeleteThread(queryKey: string, apiBasePath: string) {
  return () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (threadId: string) =>
        apiClient(`${apiBasePath}/messages/${threadId}`, {
          method: "DELETE",
        }),
      onSuccess: (_, threadId) => {
        queryClient.removeQueries({
          queryKey: [queryKey, "messages", threadId],
        });
        queryClient.invalidateQueries({ queryKey: [queryKey, "messages"] });
        queryClient.invalidateQueries({ queryKey: [queryKey, "threads"] });
      },
    });
  };
}
