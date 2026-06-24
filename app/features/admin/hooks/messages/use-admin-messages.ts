import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ApiEnvelope } from "@/lib/api-response";

export type MessageItem = {
  id: string;
  senderId: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
  read: boolean;
};

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

export function useAdminMessages(threadId: string) {
  return useInfiniteQuery<ApiEnvelope<MessagesResponse>>({
    queryKey: ["admin", "messages", threadId],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      const params: Record<string, unknown> = { limit: 30 };
      if (cursor) params.cursor = cursor;
      return apiClient<ApiEnvelope<MessagesResponse>>(`/api/admin/messages/${threadId}`, {
        params,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.hasNextPage ? lastPage.data.meta.nextCursor : undefined,
    enabled: threadId.includes("_"),
  });
}

export function useSendMessage(threadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      apiClient(`/api/admin/messages/${threadId}`, {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "messages", threadId] });
    },
  });
}

export function useDeleteMessage(threadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      apiClient(`/api/admin/messages/${threadId}/${messageId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(
        ["admin", "messages", threadId],
        (old: unknown) => {
          const data = old as { pages: { data: { messages: { id: string }[] } }[] } | undefined;
          if (!data?.pages) return old;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                messages: page.data.messages.filter((m: { id: string }) => m.id !== messageId),
              },
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "messages", threadId] });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) =>
      apiClient(`/api/admin/messages/${threadId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, threadId) => {
      queryClient.removeQueries({ queryKey: ["admin", "messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });
    },
  });
}
