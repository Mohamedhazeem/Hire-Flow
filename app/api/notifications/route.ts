import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { auth } from "@/app/features/auth/libs/auth";
import { UnauthorizedError, ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import {
  listNotifications,
  getUnreadCount,
  markNotificationsRead,
  deleteAllNotifications,
} from "@/app/features/notifications/queries/notification-queries";
import { MarkNotificationsReadSchema } from "@/app/features/notifications/schema/notification.schema";

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

  const result = await markNotificationsRead(input.data.ids, session.user.id);

  return ok(result);
}

async function handleDELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new UnauthorizedError();

  const result = await deleteAllNotifications(session.user.id);

  return ok(result);
}

export const GET = withErrorHandler(handleGET);
export const PATCH = withErrorHandler(handlePATCH);
export const DELETE = withErrorHandler(handleDELETE);
