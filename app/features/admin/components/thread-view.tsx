"use client";

import { useRef, useCallback, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import {
  useAdminMessages,
  useSendMessage,
  useDeleteMessage,
  useDeleteThread,
} from "@/app/features/admin/hooks/messages/use-admin-messages";
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

type ThreadViewProps = { threadId: string; onBack?: () => void };

function getOtherUserId(threadId: string, adminId: string): string | null {
  if (!threadId.includes(adminId)) return null;
  return threadId.startsWith(adminId + "_")
    ? threadId.slice(adminId.length + 1)
    : threadId.endsWith("_" + adminId)
      ? threadId.slice(0, threadId.length - adminId.length - 1)
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

export function ThreadView({ threadId, onBack }: ThreadViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const adminId = (session?.user as { id?: string })?.id;
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useAdminMessages(threadId);
  const queryClient = useQueryClient();
  const sendMessage = useSendMessage(threadId);
  const deleteMessage = useDeleteMessage(threadId);
  const deleteThread = useDeleteThread();
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [chatName, setChatName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const isAtBottomRef = useRef(true);
  const [confirmDeleteThread, setConfirmDeleteThread] = useState(false);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(new Set());

  const otherUserId = adminId ? getOtherUserId(threadId, adminId) : null;

  useEffect(() => {
    if (!otherUserId) return;
    apiClient<{ data: { name: string } }>(`/api/admin/users/${otherUserId}`)
      .then((res) => setChatName(res.data.name))
      .catch(() => setChatName("Unknown"));
  }, [otherUserId]);

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
    const newScrollHeight = el.scrollHeight;
    const delta = newScrollHeight - prevScrollHeightRef.current;
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
      let filePayload = {};
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
            queryClient.invalidateQueries({ queryKey: ["admin", "threads"] });
            requestAnimationFrame(() => scrollToBottom("smooth"));
          },
        },
      );
    },
    [input, selectedFile, isUploading, sendMessage, scrollToBottom, queryClient],
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
    deleteThread.mutate(threadId, {
      onSuccess: () => {
        router.push("/admin/messages");
      },
    });
  }, [deleteThread, threadId, router]);

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
      {/* Header */}
      <div className="flex items-center justify-between bg-bg-surface/60 backdrop-blur-sm border-b border-border/30 px-5 py-3 shrink-0 z-10">
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
          <div className="size-9 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-brand">
              {chatName ? chatName.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-text-heading truncate">
            {chatName || "Loading..."}
          </h2>
        </div>
        <div className="shrink-0">
          {confirmDeleteThread ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteThread(false)}
                className="text-sm text-text-heading px-2 py-1 rounded-4xl border border-border-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteThread}
                disabled={deleteThread.isPending}
                className="text-sm text-text-inverse bg-error px-2 py-1 rounded-4xl border border-error/30 disabled:opacity-50 flex items-center justify-center min-w-16"
              >
                {deleteThread.isPending ? (
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
              className="flex items-center justify-center size-8 rounded-full hover:text-error transition-colors"
              aria-label="Delete conversation"
            >
              <Trash2Icon className="size-6 text-error" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 lg:px-4 py-4 space-y-1.5 bg-bg-page/60 lg:mx-2 lg:my-1 lg:rounded-xl"
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
            <p className="text-text-muted rounded-4xl text-lg">
              No messages yet. Start the conversation.
            </p>
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
                      isOwn={msg.senderId === adminId}
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

      {/* File preview */}
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

      {/* File error */}
      {fileError && (
        <div className="flex items-center gap-2 border-t border-border-subtle px-3 py-1.5 bg-error/5 shrink-0">
          <AlertTriangleIcon className="size-4 shrink-0 text-error" />
          <p className="text-xs text-error">{fileError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-bg-surface/60 backdrop-blur-sm border-t border-border/30 px-4 py-3 shrink-0"
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
          className="shrink-0 flex items-center justify-center size-10 rounded-full bg-brand text-brand-foreground hover:bg-brand-dark transition-colors shadow-sm"
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
