import { prisma } from "@/lib/prisma";

export type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
};

type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function listNotifications(
  userId: string,
  cursor?: string,
  take = 20,
): Promise<PaginatedResult<NotificationItem>> {
  const messages = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > take;
  const rows = hasMore ? messages.slice(0, take) : messages;
  const items: NotificationItem[] = rows.map((m) => ({
    ...m,
    data: m.data as Record<string, unknown>,
  }));
  const nextCursor = hasMore ? items[items.length - 1]!.id : null;

  return { items, nextCursor, hasMore };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationsRead(ids: string[], userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      id: { in: ids },
      userId,
    },
    data: { read: true },
  });
  return { updated: result.count };
}

/** Mark all unread `new_message` notifications for a given thread as read. */
export async function markThreadNotificationsRead(threadId: string, userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      type: "new_message",
      read: false,
      data: { path: ["threadId"], equals: threadId },
    },
    data: { read: true },
  });
}

export async function deleteAllNotifications(userId: string) {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });
  return { deleted: result.count };
}
