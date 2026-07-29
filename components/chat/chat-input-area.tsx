"use client";

import { type ChangeEvent, type SyntheticEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  SendHorizonalIcon,
  Loader2Icon,
  PaperclipIcon,
  XIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { fileIcon, formatFileSize } from "@/components/chat/message-bubble";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type ChatInputAreaProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  selectedFile: File | null;
  fileError: string | null;
  isSending: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export function ChatInputArea({
  input,
  onInputChange,
  onSubmit,
  selectedFile,
  fileError,
  isSending,
  onFileSelect,
  onFileRemove,
  fileInputRef,
}: ChatInputAreaProps) {
  return (
    <>
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
              onClick={onFileRemove}
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
        onSubmit={onSubmit}
        className="flex items-center gap-2 bg-bg-surface border-t-2 border-border-subtle px-4 py-3.5 shrink-0"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
          onChange={onFileSelect}
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
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          autoComplete="off"
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
    </>
  );
}
