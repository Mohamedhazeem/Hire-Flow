"use client";

import { useEffect, useRef } from "react";
import type Pusher from "pusher-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api-response";
import { getPusherClient } from "@/lib/pusher/pusher-client";

type Channel = ReturnType<NonNullable<ReturnType<typeof getPusherClient>>["subscribe"]>;

type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export function useNotifications(userId: string) {
  return useInfiniteQuery({
    queryKey: ["notifications", userId],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      const params: Record<string, unknown> = { take: 20 };
      if (cursor) params.cursor = cursor;
      const res = await apiClient<ApiResponse<NotificationsResponse>>("/api/notifications", {
        params,
      });
      return res.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!userId,
  });
}

export function useUnreadCount(userId: string) {
  return useQuery({
    queryKey: ["notifications", "unread", userId],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<NotificationsResponse>>("/api/notifications", {
        params: { take: "1" },
      });
      return res.data?.unreadCount ?? 0;
    },
    enabled: !!userId,
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient("/api/notifications", {
        method: "PATCH",
        body: { ids },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient("/api/notifications", {
        method: "DELETE",
      }),
    onMutate: () => {
      queryClient.removeQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`private-user-${userId}`);
    channelRef.current = channel;

    // Store a reference to the bound handler so cleanup can remove only this
    // component's binding — never unbind_all(), which would destroy handlers
    // added by other components sharing the same channel.
    const handler = (data: { notification: NotificationItem }) => {
      const n = data.notification;

      queryClient.setQueryData(["notifications", userId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as {
          pages: { notifications: NotificationItem[] }[];
          pageParams: unknown[];
        };
        if (!data.pages?.length) return old;
        const newPages = [...data.pages];
        newPages[0] = {
          ...newPages[0],
          notifications: [n, ...newPages[0].notifications],
        };
        return { ...data, pages: newPages };
      });

      queryClient.setQueryData(
        ["notifications", "unread", userId],
        (old: number | undefined) => (old ?? 0) + 1,
      );

      if (n.type === "new_message") {
        const threadId = n.data.threadId as string;

        // Invalidate thread list so the sidebar shows the updated preview
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.length === 2 && query.queryKey[1] === "threads",
        });

        // Invalidate this specific thread's messages cache so clicking the
        // thread triggers a refetch instead of showing stale data. This is
        // needed because usePusherThread only runs when the thread view is
        // open — if the user is on the thread list when the message arrives,
        // the messages cache is never updated otherwise.
        if (threadId) {
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey.length === 3 &&
              query.queryKey[1] === "messages" &&
              query.queryKey[2] === threadId,
          });
        }
      }
    };

    channel.bind("new-notification", handler);

    return () => {
      channel.unbind("new-notification", handler);
      pusher.unsubscribe(`private-user-${userId}`);
      channelRef.current = null;
    };
  }, [userId, queryClient]);
}
