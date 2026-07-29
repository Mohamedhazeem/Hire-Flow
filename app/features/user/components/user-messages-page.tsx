"use client";

import { useUserThreads } from "@/app/features/user/hooks/messages/use-user-threads";
import { UserThreadView } from "@/app/features/user/components/user-thread-view";
import { MessagesPageLayout, type MessagesPageConfig } from "@/components/chat/messages-page-layout";

const config: MessagesPageConfig = {
  queryKey: "user",
  basePath: "/user/messages",
  panelDescription: "Your conversations",
  emptyListTitle: "No messages yet",
  emptyListDescription: "Recruiters will message you after you apply to jobs",
  emptySelectDescription: "Click on a thread to view messages",
};

export function UserMessagesPage() {
  const { data: threads, isLoading } = useUserThreads();

  return (
    <MessagesPageLayout
      config={config}
      threads={threads as import("@/components/chat/thread-list-item").ThreadListItemData[] | undefined}
      isLoading={isLoading}
      ThreadViewComponent={UserThreadView}
    />
  );
}
