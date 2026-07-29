"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquareTextIcon } from "lucide-react";

type MessageItem = {
  id: string;
  content: string;
  fileUrl: string | null;
  createdAt: string;
};

type RecentMessagesCardProps = {
  messages: MessageItem[];
  threadId: string;
  messagesBasePath: string;
  hasStartButton?: boolean;
  onStartConversation?: () => void;
};

export function RecentMessagesCard({
  messages,
  threadId,
  messagesBasePath,
  hasStartButton,
  onStartConversation,
}: RecentMessagesCardProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">
          Recent Messages
        </h2>
        {messages.length > 0 && threadId && (
          <Link
            href={`${messagesBasePath}?thread=${threadId}`}
            className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
          >
            <MessageSquareTextIcon className="size-3.5" />
            View All
          </Link>
        )}
      </div>
      {messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="p-3 rounded-xl bg-bg-elevated border border-border-subtle">
              <p className="text-sm text-text-body line-clamp-2">
                {msg.content || (msg.fileUrl ? "📎 File" : "")}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {new Date(msg.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-text-muted mb-2">No messages yet.</p>
          {hasStartButton && onStartConversation && (
            <Button variant="outline" size="sm" onClick={onStartConversation}>
              <MessageSquareTextIcon className="size-4 mr-1.5" />
              Start Conversation
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
