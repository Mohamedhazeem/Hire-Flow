"use client";

import { SharedThreadView, type ThreadViewHooks, type ThreadViewConfig } from "@/components/chat/shared-thread-view";
import {
  useAdminMessages,
  useSendMessage,
  useDeleteMessage,
  useDeleteThread,
} from "@/app/features/admin/hooks/messages/use-admin-messages";

type Props = { threadId: string; onBack?: () => void };

const hooks: ThreadViewHooks = {
  useMessages: useAdminMessages,
  useSendMessage: (threadId: string) => useSendMessage(threadId),
  useDeleteMessage: (threadId: string) => useDeleteMessage(threadId),
  useDeleteThread,
};

const config: ThreadViewConfig = {
  roleLabel: "Direct message",
  queryKey: "admin",
  apiBasePath: "/api/admin",
  returnPath: "/admin/messages",
  emptyMessage: "No messages yet. Start the conversation.",
};

export function AdminThreadView({ threadId, onBack }: Props) {
  return <SharedThreadView threadId={threadId} onBack={onBack} hooks={hooks} config={config} />;
}
