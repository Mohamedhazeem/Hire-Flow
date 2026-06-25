"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  Loader2Icon,
  Trash2Icon,
  CheckCheckIcon,
} from "lucide-react";

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

export function formatTime(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDateSeparator(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function getDayKey(dateString: string) {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export { formatFileSize, fileIcon };

type AttachmentPreviewProps = {
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
};

export function AttachmentPreview({
  fileUrl,
  fileName,
  fileSize,
  fileType,
}: AttachmentPreviewProps) {
  if (fileType?.startsWith("image/")) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden hover:opacity-90 transition-opacity"
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
      className="flex items-center gap-2 rounded-radius-md bg-bg-surface/20 px-3 py-2 text-sm hover:bg-bg-surface/40 transition-colors"
    >
      {fileIcon(fileType)}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{fileName ?? "Attachment"}</p>
        {fileSize != null && <p className="text-text-muted text-xs">{formatFileSize(fileSize)}</p>}
      </div>
    </a>
  );
}

type MessageBubbleProps = {
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
  isOwn: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export function MessageBubble({
  content,
  fileUrl,
  fileName,
  fileSize,
  fileType,
  createdAt,
  isOwn,
  onDelete,
  isDeleting,
}: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full group", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] relative", isOwn ? "items-end" : "items-start")}>
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/60 z-10">
            <Loader2Icon className="size-4 animate-spin text-text-muted" />
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm wrap-break-word shadow-sm",
            isOwn
              ? "bg-brand text-brand-foreground rounded-br-md"
              : "bg-bg-elevated text-text-body rounded-bl-md",
          )}
        >
          {fileUrl && (
            <div className={cn("-mx-1 -mt-1 mb-1.5", isOwn ? "text-right" : "text-left")}>
              <AttachmentPreview
                fileUrl={fileUrl}
                fileName={fileName}
                fileSize={fileSize}
                fileType={fileType}
              />
            </div>
          )}
          {content && <p className="whitespace-pre-wrap">{content}</p>}
        </div>

        <div
          className={cn(
            "flex items-center gap-1 mt-0.5 px-1",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <span className="text-[10px] text-text-muted">{formatTime(createdAt)}</span>
          {isOwn && <CheckCheckIcon className="size-3 text-text-muted" />}
          {isOwn && onDelete && !isDeleting && (
            <button
              type="button"
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error ml-1"
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
