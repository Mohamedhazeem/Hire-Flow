import { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
import { parseCursorParams, buildCursorMeta } from "@/lib/pagination";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";

const SendMessageSchema = z
  .object({
    content: z.string().min(0).max(2000).default(""),
    fileUrl: z.string().url().optional(),
    fileName: z.string().min(1).max(255).optional(),
    fileSize: z.number().int().positive().optional(),
    fileType: z.string().min(1).max(100).optional(),
  })
  .refine((data) => data.content.length > 0 || data.fileUrl, {
    message: "Message must contain text or a file attachment",
  });

const messageSelect = {
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

async function handleGET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId } = await params;
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 30;

  if (!threadId.includes("_") || threadId.startsWith("_") || threadId.endsWith("_")) {
    throw new ValidationError("Invalid thread ID format");
  }
  if (!threadId.includes(adminUser.id)) {
    throw new ValidationError("You are not a participant in this thread");
  }

  const { take, cursor: cursorVal } = parseCursorParams({ cursor, limit });
  const prismaCursor = cursorVal ? { id: cursorVal } : undefined;

  const messages = await prisma.message.findMany({
    where: { threadId },
    take,
    orderBy: { createdAt: "desc" },
    ...(prismaCursor ? { cursor: prismaCursor, skip: 1 } : {}),
    select: messageSelect,
  });

  const { items, meta } = buildCursorMeta(messages, limit);

  const unreadIds = items.filter((m) => m.senderId !== adminUser.id && !m.read).map((m) => m.id);
  if (unreadIds.length > 0) {
    void prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { read: true },
    });
  }

  return ok({ messages: items.reverse(), meta });
}

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId } = await params;

  if (!threadId.includes("_") || threadId.startsWith("_") || threadId.endsWith("_")) {
    throw new ValidationError("Invalid thread ID format");
  }

  const otherUserId = threadId.startsWith(adminUser.id + "_")
    ? threadId.slice(adminUser.id.length + 1)
    : threadId.endsWith("_" + adminUser.id)
      ? threadId.slice(0, threadId.length - adminUser.id.length - 1)
      : null;

  if (!otherUserId) {
    throw new ValidationError("You are not a participant in this thread");
  }

  const body = await request.json();
  const input = SendMessageSchema.safeParse(body);
  if (!input.success) {
    throw new ValidationError(
      input.error.issues.map((e) => e.message).join("; ") || "Invalid message",
    );
  }

  const message = await prisma.message.create({
    data: {
      threadId,
      senderId: adminUser.id,
      receiverId: otherUserId,
      content: input.data.content,
      fileUrl: input.data.fileUrl ?? null,
      fileName: input.data.fileName ?? null,
      fileSize: input.data.fileSize ?? null,
      fileType: input.data.fileType ?? null,
    },
    select: {
      ...messageSelect,
      createdAt: true,
    },
  });

  void pusher.trigger(`private-thread-${threadId}`, "new-message", {
    message: { ...message, createdAt: (message.createdAt as Date).toISOString() },
    senderId: adminUser.id,
  });

  const notification = await prisma.notification.create({
    data: {
      userId: otherUserId,
      type: "new_message",
      data: {
        threadId,
        senderId: adminUser.id,
        senderName: adminUser.name,
        preview: input.data.content.slice(0, 100),
        fileUrl: input.data.fileUrl ?? null,
        fileType: input.data.fileType ?? null,
      },
    },
  });

  void pusher.trigger(`private-user-${otherUserId}`, "new-notification", {
    notification: {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      data: notification.data as Record<string, unknown>,
    },
  });

  return ok(message, 201);
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId } = await params;

  if (!threadId.includes("_") || threadId.startsWith("_") || threadId.endsWith("_")) {
    throw new ValidationError("Invalid thread ID format");
  }

  if (!threadId.includes(adminUser.id)) {
    throw new ValidationError("You are not a participant in this thread");
  }

  await prisma.message.deleteMany({
    where: { threadId },
  });

  return ok({ deleted: true });
}

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
export const DELETE = withErrorHandler(handleDELETE);
