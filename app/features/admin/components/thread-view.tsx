"use client";

import { useRef, useCallback, useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/app/features/auth/libs/auth-client";
import {
  useAdminMessages,
  useSendMessage,
  useDeleteMessage,
  useDeleteThread,
  type MessageItem,
  type SendMessagePayload,
} from "@/app/features/admin/hooks/messages/use-admin-messages";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  SendHorizonalIcon,
  Loader2Icon,
  PaperclipIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  XIcon,
  Trash2Icon,
  AlertTriangleIcon,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

type ThreadViewProps = { threadId: string };
function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function fileIcon(mimeType: string | null) {
  if (!mimeType) return <FileIcon className="size-5" />;
  if (mimeType.startsWith("image/")) return <ImageIcon className="size-5" />;
  if (mimeType === "application/pdf") return <FileTextIcon className="size-5" />;
  return <FileIcon className="size-5" />;
}

function AttachmentPreview({
  fileUrl,
  fileName,
  fileSize,
  fileType,
}: {
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
}) {
  if (fileType?.startsWith("image/")) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-radius-md overflow-hidden border border-border-subtle hover:opacity-90 transition-opacity"
      >
        <Image
          src={fileUrl}
          alt={fileName ?? "Image attachment"}
          width={480}
          height={320}
          className="max-h-48 w-full object-cover"
          style={{ maxHeight: "12rem" }}
        />
      </a>
    );
  }
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-radius-md border border-border-subtle px-3 py-2 text-sm hover:bg-bg-sunken transition-colors"
    >
      {fileIcon(fileType)}
      <div className="flex-1 min-w-0">
        <p className="truncate text-text-body font-medium">{fileName ?? "Attachment"}</p>
        {fileSize != null && <p className="text-text-muted text-xs">{formatFileSize(fileSize)}</p>}
      </div>
    </a>
  );
}

function MessageBubble({
  message,
  isOwn,
  onDelete,
  isDeleting,
}: {
  message: MessageItem;
  isOwn: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className={cn("flex w-full group", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] space-y-1 relative", isOwn ? "items-end" : "items-start")}>
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/60 rounded-radius-lg z-10">
            <Loader2Icon className="size-4 animate-spin text-text-muted" />
          </div>
        )}
        {message.fileUrl && (
          <div className={cn(isOwn ? "flex justify-end" : "flex justify-start")}>
            <AttachmentPreview
              fileUrl={message.fileUrl}
              fileName={message.fileName}
              fileSize={message.fileSize}
              fileType={message.fileType}
            />
          </div>
        )}
        {message.content && (
          <div
            className={cn(
              "rounded-radius-lg px-3 py-2 text-sm wrap-break-word",
              isOwn ? "bg-primary text-primary-foreground" : "bg-bg-elevated text-text-body",
            )}
          >
            <p>{message.content}</p>
          </div>
        )}
        <div className={cn("flex items-center gap-1", isOwn ? "justify-end" : "justify-start")}>
          <p
            className={cn(
              "text-[10px] px-1",
              isOwn ? "text-primary-foreground/60" : "text-text-muted",
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {isOwn && !isDeleting && (
            <button
              type="button"
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error p-0.5"
              aria-label="Delete message"
            >
              <Trash2Icon className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonMessages() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
          <Skeleton className={cn("h-12 rounded-radius-lg", i % 2 === 0 ? "w-48" : "w-64")} />
        </div>
      ))}
    </div>
  );
}
export function ThreadView({ threadId }: ThreadViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const adminId = (session?.user as { id?: string })?.id;
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useAdminMessages(threadId);
  const sendMessage = useSendMessage(threadId);
  const deleteMessage = useDeleteMessage(threadId);
  const deleteThread = useDeleteThread();
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const [confirmDeleteThread, setConfirmDeleteThread] = useState(false);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(new Set());

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      prevScrollHeightRef.current = el.scrollHeight;
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (isFetchingNextPage) return;
    const el = scrollRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
    prevScrollHeightRef.current = 0;
  }, [isFetchingNextPage]);

  const allMessages = data?.pages.flatMap((p) => p.data.messages) ?? [];
  useEffect(() => {
    if (allMessages.length > prevMessageCountRef.current) {
      const isNew = allMessages.length - prevMessageCountRef.current === 1;
      if (isNew || prevMessageCountRef.current === 0) requestAnimationFrame(scrollToBottom);
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
    async (e: FormEvent) => {
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
      sendMessage.mutate({ content: trimmed, ...filePayload }, { onSuccess: () => setInput("") });
    },
    [input, selectedFile, isUploading, sendMessage],
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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
        <h2 className="text-sm font-semibold text-text-body">Conversation</h2>
        {confirmDeleteThread ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteThread(false)}
              className="text-xs text-text-muted hover:text-text-body px-2 py-1 rounded-radius-md border border-border-subtle"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteThread}
              disabled={deleteThread.isPending}
              className="text-xs text-error hover:text-error/80 px-2 py-1 rounded-radius-md border border-error/30 disabled:opacity-50"
            >
              {deleteThread.isPending ? (
                <Loader2Icon className="size-3 animate-spin" />
              ) : (
                "Confirm delete"
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDeleteThread(true)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
          >
            <Trash2Icon className="size-3" />
            Delete conversation
          </button>
        )}
      </div>{" "}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2Icon className="size-4 animate-spin text-text-muted" />
          </div>
        )}
        {hasNextPage && !isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => fetchNextPage()}
              className="text-xs text-text-muted hover:text-text-body underline"
            >
              Load older messages
            </button>
          </div>
        )}
        {isLoading ? (
          <SkeletonMessages />
        ) : allMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-muted text-sm">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          allMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === adminId}
              onDelete={() => handleDeleteMessage(msg.id)}
              isDeleting={deletingMessageIds.has(msg.id)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      {selectedFile && (
        <div className="flex items-center gap-2 border-t border-border-subtle px-3 py-2">
          <div className="flex items-center gap-2 flex-1 min-w-0 rounded-radius-md border border-border-subtle px-3 py-1.5 text-sm">
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
        <div className="flex items-center gap-2 border-t border-border-subtle px-3 py-1.5 bg-error/5">
          <AlertTriangleIcon className="size-4 shrink-0 text-error" />
          <p className="text-xs text-error">{fileError}</p>
        </div>
      )}{" "}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border-subtle p-3"
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
          className="shrink-0 flex items-center justify-center size-9 rounded-md text-text-muted hover:text-text-body hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Attach file"
        >
          <PaperclipIcon className="size-4" />
        </button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={(!input.trim() && !selectedFile) || isSending}
          className="shrink-0 flex items-center justify-center size-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
