import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher/pusher";

type NotificationInput = {
  userId: string;
  type: string;
  data: Record<string, unknown>;
};

export async function createNotification(userId: string, type: string, data: Record<string, unknown>) {
  // N2: validate the recipient exists before creating a notification, so a
  // bad userId fails fast with a clear error instead of an FK violation.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new Error(`Cannot create notification: user ${userId} does not exist.`);
  }

  const notification = await prisma.notification.create({
    data: { userId, type, data } as never,
  });

  void pusher.trigger(`private-user-${userId}`, "new-notification", {
    notification: {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    },
  });

  return notification;
}

export async function createNotificationsBulk(items: NotificationInput[]) {
  if (items.length === 0) return [];

  const notifications = await prisma.notification.createManyAndReturn({
    data: items.map(({ userId, type, data }) => ({ userId, type, data })) as never,
  });

  for (const n of notifications) {
    void pusher.trigger(`private-user-${n.userId}`, "new-notification", {
      notification: {
        ...n,
        createdAt: n.createdAt.toISOString(),
      },
    });
  }

  return notifications;
}

export async function triggerForCompany(
  companyId: string,
  type: string,
  data: Record<string, unknown>,
  options?: { excludeUserId?: string },
) {
  const members = await prisma.companyTeamMember.findMany({
    where: {
      companyId,
      ...(options?.excludeUserId ? { userId: { not: options.excludeUserId } } : {}),
    },
    select: { userId: true },
  });

  if (members.length === 0) return [];

  return createNotificationsBulk(members.map((m) => ({ userId: m.userId, type, data })));
}

/**
 * Fire-and-forget wrapper for notification side effects (M2: non-blocking).
 *
 * Notifications must never block or crash the request that triggers them, so
 * callers intentionally do not await these. This helper guarantees the promise
 * rejection is always handled: a failed background notification (e.g. the
 * recipient was deleted between the request and the async write) is logged and
 * swallowed instead of surfacing as an unhandled promise rejection.
 */
export function fireNotification(promise: Promise<unknown>): void {
  void promise.catch((error) => {
    console.error("[notifications] background notification failed:", error);
  });
}
