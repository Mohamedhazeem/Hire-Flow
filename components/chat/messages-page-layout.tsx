"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MessageSquareTextIcon } from "lucide-react";
import { ThreadListItem, type ThreadListItemData } from "@/components/chat/thread-list-item";
import { StartConversationSearch } from "@/components/shared/start-conversation-search";
import { usePresenceStore } from "@/stores/messages/presence-store";
import { useOwnPresence, useThreadPresence } from "@/stores/messages/use-thread-presence";
export type MessagesPageConfig = {
  queryKey: string;
  basePath: string;
  searchEndpoint?: string;
  panelDescription: string;
  emptyListTitle: string;
  emptyListDescription: string;
  emptySelectDescription: string;
};

type Props = {
  config: MessagesPageConfig;
  threads: ThreadListItemData[] | undefined;
  isLoading: boolean;
  ThreadViewComponent: React.ComponentType<{ threadId: string; onBack?: () => void }>;
};

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
  userId,
  activeThreadId,
  basePath,
  searchEndpoint,
  currentUserId,
  onSelectThread,
  panelDescription,
  emptyListTitle,
  emptyListDescription,
}: {
  threads: ThreadListItemData[] | undefined;
  isLoading: boolean;
  userId: string;
  activeThreadId: string | null;
  basePath: string;
  searchEndpoint?: string;
  currentUserId: string;
  onSelectThread: (threadId: string) => void;
  panelDescription: string;
  emptyListTitle: string;
  emptyListDescription: string;
}) {
  const isOnline = usePresenceStore((s) => s.isOnline);
  useThreadPresence(threads);

  return (
    <div className="flex flex-col min-h-0 h-full bg-bg-surface lg:border-r-2 lg:border-border-subtle lg:w-80 lg:shrink-0">
      <div className="shrink-0 px-4 pt-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <MessageSquareTextIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-heading">Messages</h1>
            <p className="text-xs text-text-muted mt-0.5">{panelDescription}</p>
          </div>
        </div>
      </div>
      {searchEndpoint && (
        <div className="shrink-0 px-4 pt-3 pb-2">
          <StartConversationSearch
            searchEndpoint={searchEndpoint}
            currentUserId={currentUserId}
            onSelectThread={onSelectThread}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto min-h-0 px-2">
        {isLoading ? (
          <ThreadListSkeleton />
        ) : threads && threads.length > 0 ? (
          <div className="space-y-0.5 py-1">
            {threads.map((thread) => (
              <ThreadListItem
                key={thread.threadId}
                thread={thread}
                currentUserId={userId}
                active={thread.threadId === activeThreadId}
                basePath={basePath}
                isOnline={isOnline(thread.user.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="size-12 rounded-2xl bg-bg-elevated flex items-center justify-center mb-3">
              <MessageSquareTextIcon className="size-6 text-text-muted" />
            </div>
            <p className="text-sm text-text-muted font-medium">{emptyListTitle}</p>
            <p className="text-xs text-text-muted mt-1">{emptyListDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MessagesPageLayout({ config, threads, isLoading, ThreadViewComponent }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";

  const activeThreadId = searchParams.get("thread");

  useOwnPresence(userId);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      if (threadId === searchParams.get("thread")) return;
      router.replace(`${config.basePath}?thread=${threadId}`, { scroll: false });
    },
    [router, config.basePath, searchParams],
  );

  const handleBack = useCallback(() => {
    router.replace(config.basePath, { scroll: false });
  }, [router, config.basePath]);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden -mx-4 md:-mx-6 lg:-mx-8">
      <div
        className={cn("flex-1 flex flex-col min-h-0 lg:flex-none", activeThreadId ? "hidden lg:flex lg:w-80" : "flex")}
      >
        <ThreadListPanel
          threads={threads}
          isLoading={isLoading}
          userId={userId}
          activeThreadId={activeThreadId}
          basePath={config.basePath}
          searchEndpoint={config.searchEndpoint}
          currentUserId={userId}
          onSelectThread={handleSelectThread}
          panelDescription={config.panelDescription}
          emptyListTitle={config.emptyListTitle}
          emptyListDescription={config.emptyListDescription}
        />
      </div>

      <div className={cn("flex-1 flex flex-col min-h-0", activeThreadId ? "flex" : "hidden lg:flex")}>
        {activeThreadId ? (
          <ThreadViewComponent threadId={activeThreadId} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-bg-page/60">
            <div className="text-center">
              <div className="size-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
                <MessageSquareTextIcon className="size-8 text-text-muted/50" />
              </div>
              <p className="text-text-muted text-sm font-medium">Select a conversation</p>
              <p className="text-text-muted text-xs mt-1">{config.emptySelectDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
