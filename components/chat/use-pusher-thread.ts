"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPusherClient } from "@/lib/pusher/pusher-client";
import type { MessageItem } from "@/components/chat/message-item";
import type { ThreadItem } from "@/app/features/shared/hooks/use-threads";
import { isValidThreadId } from "@/lib/thread-utils";

export function usePusherThread(
  threadId: string,
  currentUserId: string | undefined,
  queryKey: string,
  apiBasePath?: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isValidThreadId(threadId) || !currentUserId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`private-thread-${threadId}`);

    const handler = (data: { message: MessageItem; senderId: string }) => {
      if (data.senderId === currentUserId) return;
      const msg = data.message;

      queryClient.setQueryData([queryKey, "messages", threadId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const d = old as { pages: { data: { messages: MessageItem[] } }[]; pageParams: unknown[] };
        if (!d.pages?.length) return old;
        const existingIds = new Set(d.pages.flatMap((p) => p.data.messages.map((m) => m.id)));
        if (existingIds.has(msg.id)) return old;
        const np = [...d.pages];
        const li = np.length - 1;
        np[li] = {
          ...np[li],
          data: { ...np[li].data, messages: [...np[li].data.messages, msg] },
        };
        return { ...d, pages: np };
      });

      queryClient.setQueryData([queryKey, "threads"], (old: unknown) => {
        if (!Array.isArray(old)) return old;
        const thread = old.find((t: ThreadItem) => t.threadId === threadId);
        if (!thread) {
          queryClient.invalidateQueries({ queryKey: [queryKey, "threads"] });
          return old;
        }
        return old
          .map((t: ThreadItem) =>
            t.threadId === threadId
              ? {
                  ...t,
                  lastMessage: {
                    content: msg.content || (msg.fileUrl ? (msg.fileType?.startsWith("image/") ? "📷 Photo" : "📎 File") : ""),
                    createdAt: msg.createdAt,
                    senderId: msg.senderId,
                    unread: false, // user is actively viewing this thread
                  },
                }
              : t,
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessage?.createdAt ?? 0).getTime() -
              new Date(a.lastMessage?.createdAt ?? 0).getTime(),
          );
      });

      // Mark the new message as read on the server since the user is viewing
      // this thread — otherwise the notification handler's thread-list refetch
      // will return unread: true and overwrite our optimistic false above.
      if (apiBasePath) {
        fetch(`${apiBasePath}/messages/${threadId}?limit=1`).catch(() => {});
      }
    };

    channel.bind("new-message", handler);

    return () => {
      channel.unbind("new-message", handler);
      pusher.unsubscribe(`private-thread-${threadId}`);
    };
  }, [threadId, currentUserId, queryClient, queryKey, apiBasePath]);
}
