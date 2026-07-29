"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPusherClient } from "@/lib/pusher/pusher-client";
import { getUnreadMessageCount } from "@/app/features/messages/actions/get-unread-message-count";

export function useUnreadMessageCount(userId: string | undefined) {
  const queryClient = useQueryClient();
  const channelRef = useRef<{
    bind: (event: string, handler: (...args: unknown[]) => void) => void;
    unbind: (event: string, handler: (...args: unknown[]) => void) => void;
  } | null>(null);

  const query = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: () => getUnreadMessageCount(),
    enabled: !!userId,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!userId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`private-user-${userId}`);
    channelRef.current = channel;

    const onIncrement = () => {
      queryClient.setQueryData(["messages", "unread-count"], (old: number | undefined) => (old ?? 0) + 1);
    };

    const onUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    };

    channel.bind("message-unread-increment", onIncrement);
    channel.bind("message-unread-update", onUpdate);

    return () => {
      channel.unbind("message-unread-increment", onIncrement);
      channel.unbind("message-unread-update", onUpdate);
      pusher.unsubscribe(`private-user-${userId}`);
      channelRef.current = null;
    };
  }, [userId, queryClient]);

  return query;
}
