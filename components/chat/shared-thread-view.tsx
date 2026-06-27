"use client";

import { useRef, useCallback, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MessageBubble,
  formatDateSeparator,
  getDayKey,
  formatFileSize,
  fileIcon,
} from "@/components/chat/message-bubble";
import { getPusherClient } from "@/lib/pusher-client";
import type { MessageItem } from "@/components/chat/message-item";
import {
  SendHorizonalIcon,
  Loader2Icon,
  PaperclipIcon,
  XIcon,
  Trash2Icon,
  AlertTriangleIcon,
  ArrowLeftIcon,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

function getOtherUserId(threadId: string, userId: string): string | null {
  if (!threadId.includes(userId)) return null;
  return threadId.startsWith(userId + "_")
    ? threadId.slice(userId.length + 1)
    : threadId.endsWith("_" + userId)
      ? threadId.slice(0, threadId.length - userId.length - 1)
      : null;
}

function SkeletonMessages() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
          <Skeleton className={cn("h-10 rounded-2xl", i % 2 === 0 ? "w-48" : "w-64")} />
        </div>
      ))}
    </div>
  );
}

export type ThreadViewHooks = {
  useMessages: (threadId: string) => {
    data: { pages: { data: { messages: MessageItem[] } }[] } | undefined;
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isError: boolean;
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
  roleLabel: string;
  queryKey: string;
  returnPath: string;
  emptyMessage: string;
};

type Props = {
  threadId: string;
  onBack?: () => void;
  hooks: ThreadViewHooks;
  config: ThreadViewConfig;
  chatNameOverride?: string;
};

export function SharedThreadView({ threadId, onBack, hooks, config, chatNameOverride }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    hooks.useMessages(threadId);
  const queryClient = useQueryClient();
  const sendMessage = hooks.useSendMessage(threadId);
  const deleteMessage = hooks.useDeleteMessage(threadId);
  const deleteThread = hooks.useDeleteThread?.();
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [chatName, setChatName] = useState<string>(chatNameOverride ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const isAtBottomRef = useRef(true);
  const [confirmDeleteThread, setConfirmDeleteThread] = useState(false);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(new Set());

  const otherUserId = currentUserId ? getOtherUserId(threadId, currentUserId) : null;

  useEffect(() => {
    if (chatNameOverride) return;
    if (!otherUserId) return;
    apiClient<{ data: { name: string } }>(`/api/admin/users/${otherUserId}`)
      .then((res) => setChatName(res.data?.name ?? "Unknown"))
      .catch(() => setChatName("Unknown"));
  }, [otherUserId, chatNameOverride]);

  useEffect(() => {
    if (!threadId.includes("_") || !currentUserId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`private-thread-${threadId}`);

    channel.bind("new-message", (data: { message: MessageItem; senderId: string }) => {
      if (data.senderId === currentUserId) return;

      queryClient.setQueryData([config.queryKey, "messages", threadId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data_ = old as {
          pages: { data: { messages: MessageItem[] } }[];
          pageParams: unknown[];
        };
        if (!data_.pages?.length) return old;
        const existingIds = new Set(data_.pages.flatMap((p) => p.data.messages.map((m) => m.id)));
        if (existingIds.has(data.message.id)) return old;
        const newPages = [...data_.pages];
        const lastIdx = newPages.length - 1;
        newPages[lastIdx] = {
          ...newPages[lastIdx],
          data: {
            ...newPages[lastIdx].data,
            messages: [...newPages[lastIdx].data.messages, data.message],
          },
        };
        return { ...data_, pages: newPages };
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-thread-${threadId}`);
    };
  }, [threadId, currentUserId, queryClient, config.queryKey]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (el.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      prevScrollHeightRef.current = el.scrollHeight;
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (isFetchingNextPage) return;
    const el = scrollRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    const delta = el.scrollHeight - prevScrollHeightRef.current;
    el.scrollTop = delta;
    prevScrollHeightRef.current = 0;
  }, [isFetchingNextPage]);

  const allMessages = data?.pages.flatMap((p) => p.data.messages) ?? [];

  useEffect(() => {
    if (allMessages.length > prevMessageCountRef.current) {
      const isNewMessage = allMessages.length - prevMessageCountRef.current === 1;
      if (isNewMessage && isAtBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      } else if (prevMessageCountRef.current === 0) {
        requestAnimationFrame(() => scrollToBottom("instant"));
      }
    }
    prevMessageCountRef.current = allMessages.length;
  }, [allMessages.length, scrollToBottom]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File exceeds 5 MB limit (" + formatFileSize(file.size) + " selected).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("File type not allowed. Accepted: JPEG, PNG, WebP, GIF, PDF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed && !selectedFile) return;
      if (isUploading) return;
      let filePayload: Record<string, unknown> = {};
      if (selectedFile) {
        setIsUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", selectedFile);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message ?? "Upload failed");
          }
          const d = await res.json();
          filePayload = {
            fileUrl: d.data.url,
            fileName: d.data.filename,
            fileSize: d.data.size,
            fileType: d.data.mimeType,
          };
        } catch (err) {
          setFileError(err instanceof Error ? err.message : "Upload failed");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
        setSelectedFile(null);
      }
      sendMessage.mutate(
        { content: trimmed, ...filePayload },
        {
          onSuccess: () => {
            setInput("");
            queryClient.invalidateQueries({ queryKey: [config.queryKey, "threads"] });
            requestAnimationFrame(() => scrollToBottom("smooth"));
          },
        },
      );
    },
    [input, selectedFile, isUploading, sendMessage, scrollToBottom, queryClient, config.queryKey],
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      setDeletingMessageIds((prev) => new Set(prev).add(messageId));
      deleteMessage.mutate(messageId, {
        onSettled: () => {
          setDeletingMessageIds((prev) => {
            const next = new Set(prev);
            next.delete(messageId);
            return next;
          });
        },
      });
    },
    [deleteMessage],
  );

  const handleDeleteThread = useCallback(() => {
    if (!deleteThread) return;
    deleteThread.mutate(threadId, {
      onSuccess: () => {
        if (onBack) onBack();
        router.push(config.returnPath);
      },
    });
  }, [deleteThread, threadId, router, onBack, config.returnPath]);

  if (!threadId.includes("_")) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-muted text-sm">Invalid thread identifier.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-error text-sm">Failed to load messages.</p>
      </div>
    );
  }

  const isSending = sendMessage.isPending || isUploading;

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-bg-elevated/30 lg:border lg:border-border/40 overflow-hidden">
      <div className="flex items-center justify-between bg-bg-surface border-b-2 border-border-subtle px-5 py-3.5 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 flex items-center justify-center size-8 rounded-full text-text-muted hover:text-text-heading hover:bg-bg-elevated transition-colors"
              aria-label="Back to messages"
            >
              <ArrowLeftIcon className="size-4" />
            </button>
          )}
          <div className="size-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shrink-0 shadow-brand">
            <span className="text-sm font-bold text-brand-foreground">
              {chatName ? chatName.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-heading truncate">
              {chatName || "Loading..."}
            </h2>
            <p className="text-[11px] text-text-muted">{config.roleLabel}</p>
          </div>
        </div>
        {hooks.useDeleteThread && (
          <div className="shrink-0">
            {confirmDeleteThread ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteThread(false)}
                  className="text-sm text-text-heading px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-elevated transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteThread}
                  disabled={deleteThread!.isPending}
                  className="text-sm text-white bg-gradient-to-r from-error to-error/80 px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center justify-center min-w-16 font-medium shadow-sm"
                >
                  {deleteThread!.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteThread(true)}
                className="flex items-center justify-center size-9 rounded-xl hover:bg-error/10 hover:text-error transition-colors text-text-muted"
                aria-label="Delete conversation"
              >
                <Trash2Icon className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 lg:px-5 py-4 space-y-1 bg-bg-page/40 lg:mx-3 lg:my-2 lg:rounded-2xl"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Loader2Icon className="size-4 animate-spin text-text-muted" />
          </div>
        )}
        {isLoading ? (
          <SkeletonMessages />
        ) : allMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-muted rounded-4xl text-lg">{config.emptyMessage}</p>
          </div>
        ) : (
          (() => {
            const groups: { dayKey: string; label: string; messages: typeof allMessages }[] = [];
            for (const msg of allMessages) {
              const dayKey = getDayKey(msg.createdAt);
              const last = groups[groups.length - 1];
              if (last?.dayKey === dayKey) {
                last.messages.push(msg);
              } else {
                groups.push({ dayKey, label: formatDateSeparator(msg.createdAt), messages: [msg] });
              }
            }
            return groups.map((group) => (
              <div key={group.dayKey}>
                <div className="flex justify-center py-2">
                  <span className="text-sm text-accent-dark bg-bg-surface px-2 py-0.5 rounded-full font-medium shadow-xs">
                    {group.label}
                  </span>
                </div>
                {group.messages.map((msg, mi) => (
                  <div key={msg.id} className={cn(mi > 0 && "mt-1.5")}>
                    <MessageBubble
                      content={msg.content}
                      fileUrl={msg.fileUrl}
                      fileName={msg.fileName}
                      fileSize={msg.fileSize}
                      fileType={msg.fileType}
                      createdAt={msg.createdAt}
                      isOwn={msg.senderId === currentUserId}
                      onDelete={() => handleDeleteMessage(msg.id)}
                      isDeleting={deletingMessageIds.has(msg.id)}
                    />
                  </div>
                ))}
              </div>
            ));
          })()
        )}
        <div ref={bottomRef} />
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2 border-t border-border-subtle bg-bg-surface px-3 py-2 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0 rounded-radius-md border border-border-subtle bg-bg-sunken px-3 py-1.5 text-sm">
            {fileIcon(selectedFile.type)}
            <span className="truncate flex-1">{selectedFile.name}</span>
            <span className="text-text-muted text-xs shrink-0">
              {formatFileSize(selectedFile.size)}
            </span>
            <button
              type="button"
              onClick={removeSelectedFile}
              className="shrink-0 text-text-muted hover:text-text-body"
              aria-label="Remove selected file"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>
      )}

      {fileError && (
        <div className="flex items-center gap-2 border-t border-border-subtle px-3 py-1.5 bg-error/5 shrink-0">
          <AlertTriangleIcon className="size-4 shrink-0 text-error" />
          <p className="text-xs text-error">{fileError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-bg-surface border-t-2 border-border-subtle px-4 py-3.5 shrink-0"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Choose file to upload"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className="bg-bg-sunken border-border/40 rounded-full shrink-0 flex items-center justify-center size-9 text-text-muted hover:text-text-body hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Attach file"
        >
          <PaperclipIcon className="size-4" />
        </button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 rounded-2xl bg-bg-sunken border-border/40 focus-visible:ring-0 focus-visible:border-border-focus"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={(!input.trim() && !selectedFile) || isSending}
          className="shrink-0 flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-brand-foreground hover:from-brand-dark hover:to-brand transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendHorizonalIcon className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}
