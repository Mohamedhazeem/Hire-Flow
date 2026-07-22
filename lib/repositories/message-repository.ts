import { prisma } from "@/lib/prisma";
import type { IMessageRepository, CreateMessageData } from "./interfaces";

export const messageSelect = {
  id: true,
  senderId: true,
  content: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  fileType: true,
  createdAt: true,
  read: true,
} as const;

export const messageRepository: IMessageRepository = {
  findByThreadId(threadId: string, take: number, userId: string, cursor?: { id: string }) {
    return prisma.message.findMany({
      where: {
        threadId,
        NOT: { hiddenFor: { has: userId } },
      },
      take,
      orderBy: { createdAt: "desc" },
      ...(cursor ? { cursor, skip: 1 } : {}),
      select: messageSelect,
    });
  },

  create(data: CreateMessageData) {
    return prisma.message.create({
      data,
      select: { ...messageSelect, createdAt: true },
    });
  },

  async markAsRead(messageIds: string[]) {
    if (messageIds.length === 0) return;
    await prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { read: true },
    });
  },

  deleteBySender(threadId: string, senderId: string) {
    return prisma.message.deleteMany({
      where: { threadId, senderId },
    });
  },

  hideForParticipant(threadId: string, userId: string) {
    return prisma.message.updateMany({
      where: {
        threadId,
        OR: [{ senderId: userId }, { receiverId: userId }],
        NOT: { hiddenFor: { has: userId } },
      },
      data: {
        hiddenFor: { push: userId },
      },
    });
  },

  findById(messageId: string) {
    return prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, threadId: true },
    });
  },

  deleteById(messageId: string) {
    return prisma.message.delete({
      where: { id: messageId },
    });
  },
};
