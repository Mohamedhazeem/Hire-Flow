"use client";

import { useEffect, useCallback, useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { apiClient } from "@/lib/api/api-client";
import { useQueryClient } from "@tanstack/react-query";
import type { MessageItem } from "@/components/chat/message-item";
import { usePresenceStore } from "@/features/messages/stores/presence-store";
import { formatFileSize } from "@/components/chat/message-bubble";
import { usePusherThread } from "./use-pusher-thread";
import type { ThreadViewHooks, ThreadViewConfig } from "./shared-thread-view";
import { getOtherUserId, isValidThreadId } from "@/lib/thread-utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export function useThreadView(
  threadId: string,
  hooks: ThreadViewHooks,
  config: ThreadViewConfig,
  chatNameOverride?: string,
) {
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
  const hasInvalidatedThreads = useRef(false);

  const otherUserId = currentUserId ? getOtherUserId(threadId, currentUserId) : null;
  const isOnline = usePresenceStore((s) => s.isOnline);
  const subscribeToUser = usePresenceStore((s) => s.subscribeToUser);
  const unsubscribeFromUser = usePresenceStore((s) => s.unsubscribeFromUser);

  useEffect(() => {
    if (chatNameOverride) return;
    if (!otherUserId) return;
    apiClient<{ data: { name: string } }>(`/api/users/${otherUserId}`)
      .then((res) => setChatName(res.data?.name ?? "Unknown"))
      .catch(() => setChatName("Unknown"));
  }, [otherUserId, chatNameOverride]);

  useEffect(() => {
    if (!otherUserId) return;
    subscribeToUser(otherUserId);
    return () => {
      unsubscribeFromUser(otherUserId);
    };
  }, [otherUserId, subscribeToUser, unsubscribeFromUser]);

  usePusherThread(threadId, currentUserId, config.queryKey, config.apiBasePath);

  useEffect(() => {
    if (data && !hasInvalidatedThreads.current) {
      hasInvalidatedThreads.current = true;
      queryClient.invalidateQueries({ queryKey: [config.queryKey, "threads"] });
      // Invalidate notifications too: messages were just marked as read on
      // the server, so the notification dropdown should reflect that.
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    }
  }, [data, queryClient, config.queryKey]);

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
    el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
    prevScrollHeightRef.current = 0;
  }, [isFetchingNextPage]);

  const allMessages = data?.pages.flatMap((p) => p.data.messages) ?? [];

  useEffect(() => {
    if (allMessages.length > prevMessageCountRef.current) {
      const isNew = allMessages.length - prevMessageCountRef.current === 1;
      if (isNew && isAtBottomRef.current) requestAnimationFrame(() => scrollToBottom("smooth"));
      else if (prevMessageCountRef.current === 0)
        requestAnimationFrame(() => scrollToBottom("instant"));
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
      let fp: Record<string, unknown> = {};
      if (selectedFile) {
        setIsUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", selectedFile);
          const d = await apiClient<{ data: { url: string; filename: string; size: number; mimeType: string } }>("/api/upload", { method: "POST", body: fd });
          fp = {
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
        { content: trimmed, ...fp },
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
        onSettled: () =>
          setDeletingMessageIds((prev) => {
            const n = new Set(prev);
            n.delete(messageId);
            return n;
          }),
      });
    },
    [deleteMessage],
  );

  const handleDeleteThread = useCallback(() => {
    if (!deleteThread) return;
    deleteThread.mutate(threadId, {
      onSuccess: () => {
        router.push(config.returnPath);
      },
    });
  }, [deleteThread, threadId, router, config.returnPath]);

  return {
    chatName,
    otherUserId,
    isOnlineUser: otherUserId ? isOnline(otherUserId) : false,
    input,
    setInput,
    selectedFile,
    fileError,
    isSending: sendMessage.isPending || isUploading,
    confirmDeleteThread,
    setConfirmDeleteThread,
    deletingMessageIds,
    deleteThread,
    allMessages,
    currentUserId,
    isLoading,
    isFetchingNextPage,
    isError,
    fileInputRef,
    scrollRef,
    bottomRef,
    handleScroll,
    handleFileSelect,
    removeSelectedFile,
    handleSubmit,
    handleDeleteMessage,
    handleDeleteThread,
  };
}
