import { z } from "zod";
import { pusher } from "@/lib/pusher/pusher";
import { parseCursorParams, buildCursorMeta } from "@/lib/pagination";
import { ValidationError, NotFoundError } from "@/lib/api/api-error";
import { createNotification, fireNotification } from "@/lib/notifications";
import { markThreadNotificationsRead } from "@/app/features/notifications/queries/notification-queries";
import { getOtherUserId, isValidThreadId, participatesInThread } from "@/lib/thread-utils";
import { messageRepository } from "@/lib/repositories/message-repository";
import { threadRepository } from "@/lib/repositories/thread-repository";

const SendMessageSchema = z
  .object({
    content: z.string().min(0).max(2000).default(""),
    fileUrl: z.string().optional(),
    fileName: z.string().min(1).max(255).optional(),
    fileSize: z.number().int().positive().optional(),
    fileType: z.string().min(1).max(100).optional(),
  })
  .refine((data) => data.content.length > 0 || data.fileUrl, {
    message: "Message must contain text or a file attachment",
  });

export function getSendMessageSchema(requireValidUrl = false) {
  if (!requireValidUrl) return SendMessageSchema;
  return SendMessageSchema.safeExtend({
    fileUrl: z.string().url().optional(),
  });
}

type GetMessagesParams = {
  threadId: string;
  userId: string;
  cursor?: string;
  limit?: number;
};

type VerifyRelation = (userId: string, otherUserId: string) => Promise<void>;

export const messageService = {
  async getMessages({ threadId, userId, cursor, limit = 30 }: GetMessagesParams) {
    if (!isValidThreadId(threadId)) {
      throw new ValidationError("Invalid thread ID format");
    }
    if (!participatesInThread(threadId, userId)) {
      throw new ValidationError("You are not a participant in this thread");
    }

    const { take, cursor: cursorVal } = parseCursorParams({ cursor, limit });
    const prismaCursor = cursorVal ? { id: cursorVal } : undefined;

    const messages = await messageRepository.findByThreadId(threadId, take, userId, prismaCursor);

    const { items, meta } = buildCursorMeta(messages, limit);

    const unreadIds = items.filter((m) => m.senderId !== userId && !m.read).map((m) => m.id);
    if (unreadIds.length > 0) {
      void messageRepository.markAsRead(unreadIds);
      // Also mark corresponding new_message notifications as read, so the
      // notification dropdown doesn't keep showing an unread dot after the
      // user has opened the thread and seen the messages.
      void markThreadNotificationsRead(threadId, userId);
      // Broadcast so the badge updates in real time across devices.
      void pusher.trigger(`private-user-${userId}`, "message-unread-update", {});
    }

    return { messages: items.reverse(), meta };
  },

  async sendMessage(params: {
    threadId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    body: unknown;
    requireValidUrl?: boolean;
    verifyRelation?: VerifyRelation;
  }) {
    const { threadId, senderId, senderName, senderRole, body, requireValidUrl = false, verifyRelation } = params;

    if (!isValidThreadId(threadId)) {
      throw new ValidationError("Invalid thread ID format");
    }

    const otherUserId = getOtherUserId(threadId, senderId);

    if (!otherUserId) {
      throw new ValidationError("You are not a participant in this thread");
    }

    if (senderRole === "recruiter" && verifyRelation) {
      await verifyRelation(senderId, otherUserId);
    }

    const schema = getSendMessageSchema(requireValidUrl);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((e) => e.message).join("; ") || "Invalid message");
    }

    const message = await messageRepository.create({
      threadId,
      senderId,
      receiverId: otherUserId,
      content: parsed.data.content,
      fileUrl: parsed.data.fileUrl ?? null,
      fileName: parsed.data.fileName ?? null,
      fileSize: parsed.data.fileSize ?? null,
      fileType: parsed.data.fileType ?? null,
    });

    void pusher.trigger(`private-thread-${threadId}`, "new-message", {
      message: { ...message, createdAt: (message.createdAt as Date).toISOString() },
      senderId,
    });

    // Broadcast unread increment so the receiver's AccountPopover badge updates in real time.
    void pusher.trigger(`private-user-${message.receiverId}`, "message-unread-increment", {});

    fireNotification(
      createNotification(otherUserId, "new_message", {
        threadId,
        senderId,
        senderName,
        preview: parsed.data.content.slice(0, 100),
        fileUrl: parsed.data.fileUrl ?? null,
        fileType: parsed.data.fileType ?? null,
      }),
    );

    return message;
  },

  async deleteMyMessages(threadId: string, userId: string) {
    if (!isValidThreadId(threadId)) {
      throw new ValidationError("Invalid thread ID format");
    }
    if (!participatesInThread(threadId, userId)) {
      throw new ValidationError("You are not a participant in this thread");
    }
    await messageRepository.hideForParticipant(threadId, userId);
  },

  async deleteSingleMessage(threadId: string, userId: string, messageId: string) {
    if (!isValidThreadId(threadId)) {
      throw new ValidationError("Invalid thread ID format");
    }
    if (!participatesInThread(threadId, userId)) {
      throw new ValidationError("You are not a participant in this thread");
    }

    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }
    if (message.threadId !== threadId) {
      throw new ValidationError("Message does not belong to this thread");
    }
    if (message.senderId !== userId) {
      throw new ValidationError("You can only delete your own messages");
    }

    // Soft-delete: set deletedAt and hide for sender so it no longer appears in their view.
    await messageRepository.softDelete(messageId, userId);

    // Notify the other participant in real time so they see the "deleted" placeholder.
    void pusher.trigger(`private-thread-${threadId}`, "message-deleted", {
      messageId,
      threadId,
      deletedBy: userId,
    });
  },

  async getThreadList(userId: string) {
    const threads = await threadRepository.groupByThread(userId);

    if (threads.length === 0) return [];

    const threadIds = threads
      .sort((a, b) => (b._max.createdAt?.getTime() ?? 0) - (a._max.createdAt?.getTime() ?? 0))
      .map((t) => t.threadId);

    const latestMessages = await threadRepository.findLatestMessages(threadIds, userId);
    const latestByThread = new Map(latestMessages.map((m) => [m.threadId, m]));

    const otherUserIds = threadIds.map((id) => getOtherUserId(id, userId)).filter((id): id is string => id !== null);

    const users = await threadRepository.findParticipants(otherUserIds);
    const userMap = new Map(users.map((u) => [u.id, u]));

    return threadIds
      .map((threadId) => {
        const otherId = getOtherUserId(threadId, userId);
        if (!otherId) return null;
        const user = userMap.get(otherId);
        const latest = latestByThread.get(threadId);
        if (!user) return null;
        return {
          threadId,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          },
          lastMessage: latest
            ? {
                content:
                  latest.content ||
                  (latest.fileUrl ? (latest.fileType?.startsWith("image/") ? "📷 Photo" : "📎 File") : ""),
                createdAt: latest.createdAt.toISOString(),
                senderId: latest.senderId,
                unread: latest.senderId !== userId && !latest.read,
              }
            : null,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  },
};
