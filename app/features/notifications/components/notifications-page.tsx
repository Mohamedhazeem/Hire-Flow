"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
} from "@/app/features/notifications/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BellIcon,
  BellDotIcon,
  MessageSquareTextIcon,
  FileTextIcon,
  UserRoundIcon,
  BanIcon,
  Loader2Icon,
  CheckIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { formatTime } from "@/utils/format-time";

type NotificationItem = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

const notificationIconMap: Record<string, React.ReactNode> = {
  new_message: <MessageSquareTextIcon className="size-4" />,
  application_status: <FileTextIcon className="size-4" />,
  profile_viewed: <UserRoundIcon className="size-4" />,
  ban_status: <BanIcon className="size-4" />,
};

function getNotificationPreview(n: NotificationItem): string {
  const data = n.data;
  switch (n.type) {
    case "new_message":
      return data.preview ? `New message: ${(data.preview as string).slice(0, 80)}` : "New message";
    case "application_status":
      return data.previousStatus === null
        ? `New application from ${(data.applicantName as string) ?? "someone"}`
        : `Status changed to "${data.newStatus as string}"`;
    case "profile_viewed":
      return "Your profile was viewed";
    case "ban_status":
      return data.reason
        ? `Account ${data.action as string}: ${data.reason as string}`
        : `Account ${data.action as string}`;
    default:
      return "Notification";
  }
}

function getNotificationHref(n: NotificationItem, messagesBasePath: string): string {
  const data = n.data;
  const basePath = messagesBasePath.replace("/messages", "");

  switch (n.type) {
    case "new_message":
      return `${messagesBasePath}?thread=${data.threadId as string}`;
    case "application_status": {
      const isRecruiter = messagesBasePath.startsWith("/recruiter");
      const isUser = messagesBasePath.startsWith("/user");
      if (isRecruiter && data.applicationId) {
        return `/recruiter/applicants/${data.applicationId as string}`;
      }
      if (isUser && data.applicationId) {
        return `/user/applications/${data.applicationId as string}`;
      }
      if (isUser) {
        return `/user/applications`;
      }
      return `${basePath}/jobs`;
    }
    case "profile_viewed":
      return basePath;
    case "ban_status":
      return basePath;
    default:
      return basePath;
  }
}

function NotificationsPageSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="size-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

type NotificationsPageProps = {
  messagesBasePath?: string;
};

export function NotificationsPage({
  messagesBasePath = "/admin/messages",
}: NotificationsPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications(userId);
  const { data: unreadCount = 0 } = useUnreadCount(userId);
  const markAsRead = useMarkAsRead();
  const scrollRef = useRef<HTMLDivElement>(null);

  const allNotifications = useMemo(
    () =>
      data?.pages.flatMap(
        (p) => (p as { notifications?: NotificationItem[] })?.notifications ?? [],
      ) ?? [],
    [data?.pages],
  );

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = allNotifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAsRead.mutate(unreadIds);
    }
  }, [allNotifications, markAsRead]);

  const handleNotificationClick = useCallback(
    (n: NotificationItem) => {
      if (!n.read) {
        markAsRead.mutate([n.id]);
      }
      const href = getNotificationHref(n, messagesBasePath);
      router.push(href);
    },
    [markAsRead, messagesBasePath, router],
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (
        el.scrollHeight - el.scrollTop - el.clientHeight < 120 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between shrink-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <BellIcon className="size-5 text-text-muted" />
          <h1 className="text-xl sm:text-2xl font-bold text-text-heading">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-xs text-text-muted font-medium">({unreadCount} unread)</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markAsRead.isPending}
            className="flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark transition-colors disabled:opacity-50"
          >
            {markAsRead.isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <NotificationsPageSkeleton />
      ) : allNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BellDotIcon className="size-12 text-text-muted/30 mb-4" />
          <p className="text-base text-text-muted font-medium">No notifications yet</p>
          <p className="text-sm text-text-muted/60 mt-1.5 max-w-sm">
            Notifications will appear here when you receive messages or updates.
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0 -mx-4 sm:-mx-0"
          onScroll={handleScroll}
        >
          <div className="space-y-1 px-4 sm:px-0">
            {allNotifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "w-full flex items-start gap-3 sm:gap-4 px-4 py-3 sm:py-4 text-left hover:bg-bg-elevated transition-colors rounded-radius-lg",
                  !n.read && "bg-accent-subtle/5",
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center shrink-0",
                    n.type === "new_message"
                      ? "bg-brand/10 text-brand"
                      : n.type === "application_status"
                        ? "bg-warning/10 text-warning"
                        : n.type === "profile_viewed"
                          ? "bg-accent/10 text-accent"
                          : "bg-error/10 text-error",
                  )}
                >
                  {notificationIconMap[n.type] ?? <BellIcon className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      n.read ? "text-text-body" : "text-text-heading font-medium",
                    )}
                  >
                    {getNotificationPreview(n)}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-text-muted">{formatTime(n.createdAt)}</span>
                    {!n.read && <span className="size-1.5 rounded-full bg-brand shrink-0" />}
                    <ExternalLinkIcon className="size-3 text-text-muted/40 shrink-0 ml-auto" />
                  </div>
                </div>
              </button>
            ))}
          </div>
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2Icon className="size-5 animate-spin text-text-muted" />
            </div>
          )}
          {!hasNextPage && allNotifications.length > 0 && (
            <p className="text-center text-xs text-text-muted/50 py-6">All notifications loaded</p>
          )}
        </div>
      )}
    </div>
  );
}
