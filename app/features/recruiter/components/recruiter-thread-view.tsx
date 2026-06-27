"use client";

import { SharedThreadView, type ThreadViewHooks, type ThreadViewConfig } from "@/components/chat/shared-thread-view";
import {
  useRecruiterMessages,
  useSendRecruiterMessage,
  useDeleteRecruiterMessage,
  useDeleteRecruiterThread,
} from "@/app/features/recruiter/hooks/messages/use-recruiter-messages";

type Props = { threadId: string; onBack?: () => void };

const hooks: ThreadViewHooks = {
  useMessages: useRecruiterMessages,
  useSendMessage: (threadId: string) => useSendRecruiterMessage(threadId),
  useDeleteMessage: (threadId: string) => useDeleteRecruiterMessage(threadId),
  useDeleteThread: useDeleteRecruiterThread,
};

const config: ThreadViewConfig = {
  roleLabel: "Direct message",
  queryKey: "recruiter",
  returnPath: "/recruiter/messages",
  emptyMessage: "No messages yet. Start the conversation.",
};

export function RecruiterThreadView({ threadId, onBack }: Props) {
  return <SharedThreadView threadId={threadId} onBack={onBack} hooks={hooks} config={config} />;
}
