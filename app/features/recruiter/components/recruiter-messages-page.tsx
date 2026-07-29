"use client";

import { useRecruiterThreads } from "@/app/features/recruiter/hooks/messages/use-recruiter-threads";
import { RecruiterThreadView } from "@/app/features/recruiter/components/recruiter-thread-view";
import { MessagesPageLayout, type MessagesPageConfig } from "@/components/chat/messages-page-layout";

const config: MessagesPageConfig = {
  queryKey: "recruiter",
  basePath: "/recruiter/messages",
  searchEndpoint: "/api/recruiter/messages/search",
  panelDescription: "Conversations with applicants",
  emptyListTitle: "No conversations yet",
  emptyListDescription: "Go to a job&apos;s applicants to start messaging",
  emptySelectDescription: "Or search for an applicant above to start a new thread",
};

export function RecruiterMessagesPage() {
  const { data: threads, isLoading } = useRecruiterThreads();

  return (
    <MessagesPageLayout
      config={config}
      threads={threads as import("@/components/chat/thread-list-item").ThreadListItemData[] | undefined}
      isLoading={isLoading}
      ThreadViewComponent={RecruiterThreadView}
    />
  );
}
