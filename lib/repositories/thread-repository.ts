import { prisma } from "@/lib/prisma";

export const threadRepository = {
  groupByThread(userId: string) {
    return prisma.message.groupBy({
      by: ["threadId"],
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      _max: { createdAt: true },
    });
  },

  findLatestMessages(threadIds: string[]) {
    return prisma.message.findMany({
      where: { threadId: { in: threadIds } },
      orderBy: { createdAt: "desc" },
      distinct: ["threadId"],
      select: {
        threadId: true,
        content: true,
        createdAt: true,
        senderId: true,
        read: true,
        fileUrl: true,
        fileType: true,
      },
    });
  },

  findParticipants(userIds: string[]) {
    return prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, image: true, role: true },
    });
  },
};
