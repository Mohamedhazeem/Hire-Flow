"use client";

import { ArrowLeftIcon, Trash2Icon, Loader2Icon } from "lucide-react";

type ChatHeaderProps = {
  chatName: string;
  onBack?: () => void;
  roleLabel: string;
  isOnline: boolean;
  hasDeleteThread: boolean;
  confirmDelete: boolean;
  isDeletingThread: boolean;
  onDeleteClick: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
};

export function ChatHeader({
  chatName,
  onBack,
  roleLabel,
  isOnline,
  hasDeleteThread,
  confirmDelete,
  isDeletingThread,
  onDeleteClick,
  onCancelDelete,
  onConfirmDelete,
}: ChatHeaderProps) {
  return (
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
        <div className="size-10 rounded-xl bg-linear-to-br from-brand to-brand-dark flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-brand-foreground">
            {chatName ? chatName.charAt(0).toUpperCase() : "?"}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text-heading truncate">
            {chatName || "Loading..."}
          </h2>
          {isOnline ? (
            <p className="text-[11px] text-green-500 font-medium">Online</p>
          ) : (
            <p className="text-[11px] text-text-muted">{roleLabel}</p>
          )}
        </div>
      </div>
      {hasDeleteThread && (
        <div className="shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancelDelete}
                className="text-sm text-text-heading px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeletingThread}
                className="text-sm text-white bg-linear-to-r from-error to-error/80 px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center justify-center min-w-16 font-medium shadow-sm"
              >
                {isDeletingThread ? <Loader2Icon className="size-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onDeleteClick}
              className="flex items-center justify-center size-9 rounded-xl hover:bg-error/10 hover:text-error transition-colors text-text-muted"
              aria-label="Delete conversation"
            >
              <Trash2Icon className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
