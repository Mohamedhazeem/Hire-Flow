"use client";

import { SharedThreadView, type ThreadViewHooks, type ThreadViewConfig } from "@/components/chat/shared-thread-view";
import {
  useUserMessages,
  useSendUserMessage,
  useDeleteUserMessage,
  useDeleteUserThread,
} from "@/app/features/user/hooks/messages/use-user-messages";

type Props = { threadId: string; onBack?: () => void };

const hooks: ThreadViewHooks = {
  useMessages: useUserMessages,
  useSendMessage: (threadId: string) => useSendUserMessage(threadId),
  useDeleteMessage: (threadId: string) => useDeleteUserMessage(threadId),
  useDeleteThread: useDeleteUserThread,
};

const config: ThreadViewConfig = {
  roleLabel: "Recruiter",
  queryKey: "user",
  returnPath: "/user/messages",
  emptyMessage: "No messages yet. Wait for the recruiter to reach out.",
};

export function UserThreadView({ threadId, onBack }: Props) {
  return <SharedThreadView threadId={threadId} onBack={onBack} hooks={hooks} config={config} />;
}
