"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { formatTime } from "@/utils/format-time";

export type ThreadListItemData = {
  threadId: string;
  user: { id: string; name: string };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    unread: boolean;
  } | null;
};

type Props = {
  thread: ThreadListItemData;
  currentUserId: string;
  active: boolean;
  basePath: string;
  isOnline: boolean;
};

export function ThreadListItem({ thread, currentUserId, active, basePath, isOnline }: Props) {
  const router = useRouter();
  const isUnread = thread.lastMessage?.senderId !== currentUserId && thread.lastMessage?.unread;

  return (
    <button
      type="button"
      onClick={() => router.push(`${basePath}?thread=${thread.threadId}`, { scroll: false })}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-bg-elevated transition-colors rounded-radius-lg group",
        active && "bg-bg-elevated",
      )}
    >
      <div className="relative shrink-0">
        <div className="size-10 rounded-xl bg-linear-to-br from-brand/15 to-brand/5 flex items-center justify-center">
          <span className="text-sm font-bold text-brand">
            {thread.user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 ring-2 ring-bg-surface" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm truncate",
              isUnread ? "font-semibold text-text-heading" : "font-medium text-text-body",
            )}
          >
            {thread.user.name}
          </span>
          <span className="text-[10px] text-text-muted shrink-0">
            {thread.lastMessage ? formatTime(thread.lastMessage.createdAt) : ""}
          </span>
        </div>
        <p
          className={cn(
            "text-xs truncate mt-0.5",
            isUnread ? "font-medium text-text-body" : "text-text-muted",
          )}
        >
          {thread.lastMessage?.content || "No messages yet"}
        </p>
      </div>
      {isUnread && <div className="size-2 rounded-full bg-brand shrink-0 mt-1.5" />}
      <ChevronRightIcon className="size-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
    </button>
  );
}
