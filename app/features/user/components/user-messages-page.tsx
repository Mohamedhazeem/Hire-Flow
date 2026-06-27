"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import {
  useUserThreads,
} from "@/app/features/user/hooks/messages/use-user-threads";
import { UserThreadView } from "@/app/features/user/components/user-thread-view";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MessageSquareTextIcon } from "lucide-react";
import {
  ThreadListItem,
  type ThreadListItemData,
} from "@/components/chat/thread-list-item";
import { usePresenceStore } from "@/features/messages/stores/presence-store";
import {
  useOwnPresence,
  useThreadPresence,
} from "@/features/messages/stores/use-thread-presence";

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

export function UserMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeThreadId = searchParams.get("thread");
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";
  const { data: threads, isLoading } = useUserThreads();
  const isOnline = usePresenceStore((s) => s.isOnline);

  useOwnPresence(userId);
  useThreadPresence(threads);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden -m-4 md:-m-6 lg:-m-8">
      <div
        className={cn(
          "flex-1 flex flex-col min-h-0 lg:flex-none",
          activeThreadId ? "hidden lg:flex lg:w-80" : "flex",
        )}
      >
        <div className="flex flex-col min-h-0 h-full bg-bg-surface lg:border-r-2 lg:border-border-subtle lg:w-80 lg:shrink-0">
          <div className="shrink-0 px-4 pt-5 pb-3 border-b border-border-subtle">
            <h1 className="text-lg font-bold text-text-heading">Messages</h1>
            <p className="text-xs text-text-muted mt-0.5">Your conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-2">
            {isLoading ? (
              <ThreadListSkeleton />
            ) : threads && threads.length > 0 ? (
              <div className="space-y-0.5 py-1">
                {threads.map((thread) => (
                  <ThreadListItem
                    key={thread.threadId}
                    thread={thread as unknown as ThreadListItemData}
                    currentUserId={userId}
                    active={thread.threadId === activeThreadId}
                    basePath="/user/messages"
                    isOnline={isOnline(thread.user.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="size-12 rounded-2xl bg-bg-elevated flex items-center justify-center mb-3">
                  <MessageSquareTextIcon className="size-6 text-text-muted" />
                </div>
                <p className="text-sm text-text-muted font-medium">No messages yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Recruiters will message you after you apply to jobs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col min-h-0",
          activeThreadId ? "flex" : "hidden lg:flex",
        )}
      >
        {activeThreadId ? (
          <UserThreadView
            threadId={activeThreadId}
            onBack={() => router.push("/user/messages", { scroll: false })}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-bg-page/60">
            <div className="text-center">
              <div className="size-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
                <MessageSquareTextIcon className="size-8 text-text-muted/50" />
              </div>
              <p className="text-text-muted text-sm font-medium">Select a conversation</p>
              <p className="text-text-muted text-xs mt-1">
                Click on a thread to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
