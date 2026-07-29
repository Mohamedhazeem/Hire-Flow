"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useClearAllNotifications,
} from "@/app/features/notifications/hooks/use-notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverHeader,
} from "@/components/ui/popover";
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
  Trash2Icon,
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

function NotificationsSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

type NotificationDropdownProps = {
  messagesBasePath?: string;
};

export function NotificationDropdown({
  messagesBasePath = "/admin/messages",
}: NotificationDropdownProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications(userId);
  const { data: unreadCount = 0 } = useUnreadCount(userId);
  const markAsRead = useMarkAsRead();
  const clearAll = useClearAllNotifications();

  // Realtime notifications handled by RoleLayoutClient

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
        queryClient.setQueryData(["notifications", "unread", userId], (old: number | undefined) =>
          Math.max(0, (old ?? 1) - 1),
        );
        queryClient.setQueryData(["notifications", userId], (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const data = old as {
            pages: { notifications: NotificationItem[] }[];
            pageParams: unknown[];
          };
          if (!data.pages?.length) return old;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((item) =>
                item.id === n.id ? { ...item, read: true } : item,
              ),
            })),
          };
        });
      }
      const href = getNotificationHref(n, messagesBasePath);
      router.push(href);
    },
    [markAsRead, messagesBasePath, router, queryClient, userId],
  );

  return (
    <Popover>
      <PopoverTrigger className="relative size-9 flex items-center justify-center rounded-xl hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-body">
        {unreadCount > 0 ? (
          <>
            <BellDotIcon className="size-5" />
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        ) : (
          <BellIcon className="size-5" />
        )}
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        alignOffset={-4}
        className="w-80 sm:w-96 p-0 overflow-hidden"
      >
        <PopoverHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-2 border-b border-border-subtle">
          <PopoverTitle className="text-sm font-semibold text-text-heading">
            Notifications
          </PopoverTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAsRead.isPending}
                className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition-colors disabled:opacity-50"
              >
                {markAsRead.isPending ? (
                  <Loader2Icon className="size-3 animate-spin" />
                ) : (
                  <CheckIcon className="size-3" />
                )}
                Mark all read
              </button>
            )}
            {allNotifications.length > 0 && (
              <button
                type="button"
                onClick={() => clearAll.mutate()}
                disabled={clearAll.isPending}
                className="flex items-center gap-1 text-xs font-medium text-error hover:text-error/80 transition-colors disabled:opacity-50"
              >
                {clearAll.isPending ? (
                  <Loader2Icon className="size-3 animate-spin" />
                ) : (
                  <Trash2Icon className="size-3" />
                )}
                Clear all
              </button>
            )}
          </div>
        </PopoverHeader>

        <div
          className="max-h-80 overflow-y-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (
              el.scrollHeight - el.scrollTop - el.clientHeight < 60 &&
              hasNextPage &&
              !isFetchingNextPage
            ) {
              fetchNextPage();
            }
          }}
        >
          {isLoading ? (
            <NotificationsSkeleton />
          ) : allNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <BellIcon className="size-8 text-text-muted/40 mb-2" />
              <p className="text-sm text-text-muted font-medium">No notifications yet</p>
              <p className="text-xs text-text-muted/60 mt-1">
                Notifications will appear here when you receive messages or updates.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {allNotifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-elevated transition-colors",
                    !n.read && "bg-accent-subtle/10",
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center shrink-0",
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
                        "text-xs leading-relaxed",
                        n.read ? "text-text-body" : "text-text-heading font-medium",
                      )}
                    >
                      {getNotificationPreview(n)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-text-muted">{formatTime(n.createdAt)}</span>
                      {!n.read && <span className="size-1.5 rounded-full bg-brand shrink-0" />}
                      <ExternalLinkIcon className="size-2.5 text-text-muted/50 shrink-0 ml-auto" />
                    </div>
                  </div>
                </button>
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center py-3">
                  <Loader2Icon className="size-4 animate-spin text-text-muted" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border-subtle px-4 py-2 bg-bg-surface">
          <p className="text-[10px] text-text-muted text-center">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
