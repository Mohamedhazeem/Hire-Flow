import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { messageService } from "@/lib/services/message-service";

type VerifyRelation = (userId: string, otherUserId: string) => Promise<void>;

type ThreadIdHandlerOptions = {
  allowedRoles: string[];
  requireValidUrl?: boolean;
  verifyRelation?: VerifyRelation;
};

export function createThreadIdMessageHandlers(options: ThreadIdHandlerOptions) {
  const { allowedRoles, requireValidUrl, verifyRelation } = options;

  async function handleGET(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> },
  ) {
    const user = await requireRole(allowedRoles);
    const { threadId } = await params;
    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 30;

    const result = await messageService.getMessages({ threadId, userId: user.id, cursor, limit });
    return ok(result);
  }

  async function handlePOST(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> },
  ) {
    const user = await requireRole(allowedRoles);
    const { threadId } = await params;
    const body = await request.json();

    const message = await messageService.sendMessage({
      threadId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      body,
      requireValidUrl,
      verifyRelation,
    });

    return ok(message, 201);
  }

  async function handleDELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> },
  ) {
    const user = await requireRole(allowedRoles);
    const { threadId } = await params;

    await messageService.deleteMyMessages(threadId, user.id);

    return ok({ deleted: true });
  }

  return {
    GET: withErrorHandler(handleGET),
    POST: withErrorHandler(handlePOST),
    DELETE: withErrorHandler(handleDELETE),
  };
}

type MessageIdHandlerOptions = {
  allowedRoles: string[];
};

export function createMessageIdDeleteHandler(options: MessageIdHandlerOptions) {
  const { allowedRoles } = options;

  async function handleDELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ threadId: string; messageId: string }> },
  ) {
    const user = await requireRole(allowedRoles);
    const { threadId, messageId } = await params;

    await messageService.deleteSingleMessage(threadId, user.id, messageId);

    return ok({ deleted: true });
  }

  return {
    DELETE: withErrorHandler(handleDELETE),
  };
}

type ThreadListHandlerOptions = {
  allowedRoles: string[];
};

export function createThreadListHandler(options: ThreadListHandlerOptions) {
  const { allowedRoles } = options;

  async function handleGET() {
    const user = await requireRole(allowedRoles);
    const threads = await messageService.getThreadList(user.id);
    return ok(threads);
  }

  return {
    GET: withErrorHandler(handleGET),
  };
}
