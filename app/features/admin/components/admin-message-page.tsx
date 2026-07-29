"use client";

import { useAdminThreads } from "@/app/features/admin/hooks/messages/use-admin-threads";
import { AdminThreadView } from "@/app/features/admin/components/admin-thread-view";
import { MessagesPageLayout, type MessagesPageConfig } from "@/components/chat/messages-page-layout";

const config: MessagesPageConfig = {
  queryKey: "admin",
  basePath: "/admin/messages",
  searchEndpoint: "/api/admin/messages/search",
  panelDescription: "Your conversations",
  emptyListTitle: "No conversations yet",
  emptyListDescription: "Search for a user above to start messaging",
  emptySelectDescription: "Or start a new thread from the sidebar",
};

export default function AdminMessagesPage() {
  const { data: threads, isLoading } = useAdminThreads();

  return (
    <MessagesPageLayout
      config={config}
      threads={threads as import("@/components/chat/thread-list-item").ThreadListItemData[] | undefined}
      isLoading={isLoading}
      ThreadViewComponent={AdminThreadView}
    />
  );
}
