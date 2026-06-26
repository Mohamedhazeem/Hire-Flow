import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { auth } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import {
  listNotifications,
  getUnreadCount,
} from "@/app/features/notifications/queries/notification-queries";
import { MarkNotificationsReadSchema } from "@/app/features/notifications/schema/notification.schema";
import { prisma } from "@/lib/prisma";

async function handleGET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new UnauthorizedError();

  const userId = session.user.id;
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const take = searchParams.get("take") ? Number(searchParams.get("take")) : 20;

  const { items, nextCursor, hasMore } = await listNotifications(userId, cursor, take);
  const unreadCount = await getUnreadCount(userId);

  return ok({
    notifications: items.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
    nextCursor,
    hasMore,
  });
}

async function handlePATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new UnauthorizedError();

  const body = await request.json();
  const input = MarkNotificationsReadSchema.safeParse(body);
  if (!input.success) {
    throw new ValidationError(input.error.issues.map((e) => e.message).join("; "));
  }

  const result = await prisma.notification.updateMany({
    where: {
      id: { in: input.data.ids },
      userId: session.user.id,
    },
    data: { read: true },
  });

  return ok({ updated: result.count });
}

export const GET = withErrorHandler(handleGET);
export const PATCH = withErrorHandler(handlePATCH);
