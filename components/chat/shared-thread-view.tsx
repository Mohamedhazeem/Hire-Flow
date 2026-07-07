"use client";

import type { MessageItem } from "@/components/chat/message-item";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInputArea } from "@/components/chat/chat-input-area";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { useThreadView } from "@/components/chat/use-thread-view";
import { isValidThreadId } from "@/lib/thread-utils";

export type ThreadViewHooks = {
  useMessages: (threadId: string) => {
    data: { pages: { data: { messages: MessageItem[] } }[] } | undefined;
    isLoading: boolean; isFetchingNextPage: boolean; hasNextPage: boolean;
    fetchNextPage: () => void; isError: boolean;
  };
  useSendMessage: (threadId: string) => {
    mutate: (payload: Record<string, unknown>, opts?: { onSuccess?: () => void }) => void;
    isPending: boolean;
  };
  useDeleteMessage: (threadId: string) => {
    mutate: (messageId: string, opts?: { onSettled?: () => void }) => void;
    isPending: boolean;
  };
  useDeleteThread?: () => {
    mutate: (threadId: string, opts?: { onSuccess?: () => void }) => void;
    isPending: boolean;
  };
};

export type ThreadViewConfig = {
  roleLabel: string; queryKey: string; returnPath: string; emptyMessage: string;
};

type Props = {
  threadId: string; onBack?: () => void;
  hooks: ThreadViewHooks; config: ThreadViewConfig; chatNameOverride?: string;
};

export function SharedThreadView({ threadId, onBack, hooks, config, chatNameOverride }: Props) {
  const view = useThreadView(threadId, hooks, config, chatNameOverride);

  if (!isValidThreadId(threadId)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-muted text-sm">Invalid thread identifier.</p>
      </div>
    );
  }

  if (view.isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-error text-sm">Failed to load messages.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-bg-elevated/30 lg:border lg:border-border/40 overflow-hidden">
      <ChatHeader
        chatName={view.chatName}
        onBack={onBack}
        roleLabel={config.roleLabel}
        isOnline={view.isOnlineUser}
        hasDeleteThread={!!hooks.useDeleteThread}
        confirmDelete={view.confirmDeleteThread}
        isDeletingThread={view.deleteThread?.isPending ?? false}
        onDeleteClick={() => view.setConfirmDeleteThread(true)}
        onCancelDelete={() => view.setConfirmDeleteThread(false)}
        onConfirmDelete={view.handleDeleteThread}
      />

      <ChatMessageList
        isLoading={view.isLoading}
        isFetchingNextPage={view.isFetchingNextPage}
        messages={view.allMessages}
        currentUserId={view.currentUserId}
        emptyMessage={config.emptyMessage}
        deletingMessageIds={view.deletingMessageIds}
        onDeleteMessage={view.handleDeleteMessage}
        scrollRef={view.scrollRef}
        bottomRef={view.bottomRef}
        onScroll={view.handleScroll}
      />

      <ChatInputArea
        input={view.input}
        onInputChange={view.setInput}
        onSubmit={view.handleSubmit}
        selectedFile={view.selectedFile}
        fileError={view.fileError}
        isSending={view.isSending}
        onFileSelect={view.handleFileSelect}
        onFileRemove={view.removeSelectedFile}
        fileInputRef={view.fileInputRef}
      />
    </div>
  );
}
