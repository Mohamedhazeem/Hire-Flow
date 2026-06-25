"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import {
  useAdminThreads,
  type ThreadItem,
} from "@/app/features/admin/hooks/messages/use-admin-threads";
import { ThreadView } from "@/app/features/admin/components/thread-view";
import { StartThreadSearch } from "@/app/features/admin/components/start-thread-search";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MessageSquareTextIcon,
  ChevronRightIcon,
} from "lucide-react";

function formatTime(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

function ThreadListItem({
  thread,
  adminId,
  active,
}: {
  thread: ThreadItem;
  adminId: string;
  active?: boolean;
}) {
  const router = useRouter();
  const isUnread = thread.lastMessage?.senderId !== adminId && thread.lastMessage?.unread;

  return (
    <button
      type="button"
      onClick={() => router.push(`/admin/messages?thread=${thread.threadId}`, { scroll: false })}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-bg-elevated transition-colors rounded-radius-lg group",
        active && "bg-bg-elevated",
      )}
    >
      <div className="size-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-brand">
          {thread.user.name.charAt(0).toUpperCase()}
        </span>
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

function ThreadListSkeleton() {
  return (
    <div className="space-y-2 mt-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-3">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ThreadListPanel({
  threads,
  isLoading,
  adminId,
  activeThreadId,
}: {
  threads: ThreadItem[] | undefined;
  isLoading: boolean;
  adminId: string;
  activeThreadId: string | null;
}) {
  return (
    <div className="flex flex-col min-h-0 bg-bg-surface lg:border-r lg:border-border-subtle lg:w-80 lg:shrink-0">
      <div className="shrink-0 pl-4 pr-4 pt-2 pb-2">
        <div className="lg:pt-2">
          <h1 className="text-xl font-bold text-text-heading">Messages</h1>
          <p className="text-sm text-text-muted mt-0.5">Start a new conversation</p>
        </div>
      </div>
      <div className="shrink-0 px-4 pb-2">
        <StartThreadSearch />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <ThreadListSkeleton />
        ) : threads && threads.length > 0 ? (
          <div className="space-y-0.5">
            {threads.map((thread) => (
              <ThreadListItem
                key={thread.threadId}
                thread={thread}
                adminId={adminId}
                active={thread.threadId === activeThreadId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquareTextIcon className="size-8 text-text-muted mb-2" />
            <p className="text-sm text-text-muted">No conversations yet</p>
            <p className="text-xs text-text-muted mt-1">
              Search for a user above to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeThreadId = searchParams.get("thread");
  const { data: session } = useSession();
  const adminId = (session?.user as { id?: string })?.id ?? "";
  const { data: threads, isLoading } = useAdminThreads();

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden -mx-4 lg:-mx-8 -mb-4 lg:-mb-8">
      {/* Thread list: always visible on desktop, hidden on mobile when thread is active */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 lg:flex-none",
        activeThreadId ? "hidden lg:flex lg:w-80" : "flex",
      )}>
        <ThreadListPanel
          threads={threads}
          isLoading={isLoading}
          adminId={adminId}
          activeThreadId={activeThreadId}
        />
      </div>

      {/* Thread view: shown on desktop inline; on mobile replaces thread list */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0",
        activeThreadId ? "flex" : "hidden lg:flex",
      )}>
        {activeThreadId ? (
          <ThreadView
            threadId={activeThreadId}
            onBack={() => router.push("/admin/messages", { scroll: false })}
          />
        ) : (
          <div className="flex-1 hidden lg:flex items-center justify-center bg-bg-elevated/30">
            <div className="text-center">
              <MessageSquareTextIcon className="size-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted text-sm">
                Select a conversation or start a new thread
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
