"use client";

import { useEffect } from "react";
import { usePresenceStore } from "@/features/messages/stores/presence-store";
import { getPusherClient } from "@/lib/pusher/pusher-client";

export function useOwnPresence(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channelName = `presence-online-${userId}`;
    pusher.subscribe(channelName);
    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [userId]);
}

export function useThreadPresence(threads: Array<{ user: { id: string } }> | undefined) {
  const subscribeToUser = usePresenceStore((s) => s.subscribeToUser);
  const unsubscribeFromUser = usePresenceStore((s) => s.unsubscribeFromUser);

  useEffect(() => {
    if (!threads?.length) return;
    const userIds = [...new Set(threads.map((t) => t.user.id))];
    for (const id of userIds) {
      subscribeToUser(id);
    }
    return () => {
      for (const id of userIds) {
        unsubscribeFromUser(id);
      }
    };
  }, [threads, subscribeToUser, unsubscribeFromUser]);
}
