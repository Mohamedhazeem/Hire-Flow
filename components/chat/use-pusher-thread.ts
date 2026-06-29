"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPusherClient } from "@/lib/pusher-client";
import type { MessageItem } from "@/components/chat/message-item";

export function usePusherThread(
  threadId: string,
  currentUserId: string | undefined,
  queryKey: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!threadId.includes("_") || !currentUserId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`private-thread-${threadId}`);

    channel.bind("new-message", (data: { message: MessageItem; senderId: string }) => {
      if (data.senderId === currentUserId) return;
      queryClient.setQueryData([queryKey, "messages", threadId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const d = old as { pages: { data: { messages: MessageItem[] } }[]; pageParams: unknown[] };
        if (!d.pages?.length) return old;
        const existingIds = new Set(d.pages.flatMap((p) => p.data.messages.map((m) => m.id)));
        if (existingIds.has(data.message.id)) return old;
        const np = [...d.pages];
        const li = np.length - 1;
        np[li] = { ...np[li], data: { ...np[li].data, messages: [...np[li].data.messages, data.message] } };
        return { ...d, pages: np };
      });
    });

    return () => { channel.unbind_all(); pusher.unsubscribe(`private-thread-${threadId}`); };
  }, [threadId, currentUserId, queryClient, queryKey]);
}
