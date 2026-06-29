"use client";

import { cn } from "@/lib/utils";
import {
  MessageBubble,
  formatDateSeparator,
  getDayKey,
} from "@/components/chat/message-bubble";
import type { MessageItem } from "@/components/chat/message-item";
import { Loader2Icon } from "lucide-react";

type ChatMessageListProps = {
  isLoading: boolean;
  isFetchingNextPage: boolean;
  messages: MessageItem[];
  currentUserId?: string;
  emptyMessage: string;
  deletingMessageIds: Set<string>;
  onDeleteMessage: (messageId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
};

export function ChatMessageList({
  isLoading,
  isFetchingNextPage,
  messages,
  currentUserId,
  emptyMessage,
  deletingMessageIds,
  onDeleteMessage,
  scrollRef,
  bottomRef,
  onScroll,
}: ChatMessageListProps) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="flex-1 min-h-0 overflow-y-auto px-3 lg:px-5 pb-4 space-y-1 bg-bg-page/40 lg:mx-3 lg:rounded-2xl"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <Loader2Icon className="size-4 animate-spin text-text-muted" />
        </div>
      )}
      {isLoading ? (
        <SkeletonMessages />
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-text-muted rounded-4xl text-lg">{emptyMessage}</p>
        </div>
      ) : (
        (() => {
          const groups: { dayKey: string; label: string; messages: typeof messages }[] = [];
          for (const msg of messages) {
            const dayKey = getDayKey(msg.createdAt);
            const last = groups[groups.length - 1];
            if (last?.dayKey === dayKey) {
              last.messages.push(msg);
            } else {
              groups.push({ dayKey, label: formatDateSeparator(msg.createdAt), messages: [msg] });
            }
          }
          return groups.map((group) => (
            <div key={group.dayKey}>
              <div className="flex justify-center py-2">
                <span className="text-sm text-accent-dark bg-bg-surface px-2 py-0.5 rounded-full font-medium shadow-xs">
                  {group.label}
                </span>
              </div>
              {group.messages.map((msg, mi) => (
                <div key={msg.id} className={cn(mi > 0 && "mt-1.5")}>
                  <MessageBubble
                    content={msg.content}
                    fileUrl={msg.fileUrl}
                    fileName={msg.fileName}
                    fileSize={msg.fileSize}
                    fileType={msg.fileType}
                    createdAt={msg.createdAt}
                    isOwn={msg.senderId === currentUserId}
                    onDelete={() => onDeleteMessage(msg.id)}
                    isDeleting={deletingMessageIds.has(msg.id)}
                  />
                </div>
              ))}
            </div>
          ));
        })()
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function SkeletonMessages() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
          <div className={cn("h-10 rounded-2xl bg-muted animate-pulse", i % 2 === 0 ? "w-48" : "w-64")} />
        </div>
      ))}
    </div>
  );
}
