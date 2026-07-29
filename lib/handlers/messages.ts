import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { messageService } from "@/lib/services/message-service";

type VerifyRelation = (userId: string, otherUserId: string) => Promise<void>;

type ThreadIdHandlerOptions = {
  allowedRoles: string[];
  requireValidUrl?: boolean;
  verifyRelation?: VerifyRelation;
};

export function createThreadIdMessageHandlers(options: ThreadIdHandlerOptions) {
  const { allowedRoles, requireValidUrl, verifyRelation } = options;

  const handleGET = withRateLimit(
    async (request: NextRequest, { params }: { params: Promise<{ threadId: string }> }) => {
      const user = await requireRole(allowedRoles);
      const { threadId } = await params;
      const { searchParams } = request.nextUrl;
      const cursor = searchParams.get("cursor") ?? undefined;
      const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 30;

      const result = await messageService.getMessages({ threadId, userId: user.id, cursor, limit });
      return ok(result);
    },
    "messages:list",
  );

  const handlePOST = withRateLimit(
    async (request: NextRequest, { params }: { params: Promise<{ threadId: string }> }) => {
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
    },
    "messages:send",
  );

  const handleDELETE = withRateLimit(
    async (_request: NextRequest, { params }: { params: Promise<{ threadId: string }> }) => {
      const user = await requireRole(allowedRoles);
      const { threadId } = await params;

      await messageService.deleteMyMessages(threadId, user.id);

      return ok({ deleted: true });
    },
    "messages:delete",
  );

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

  const handleDELETE = withRateLimit(
    async (_request: NextRequest, { params }: { params: Promise<{ threadId: string; messageId: string }> }) => {
      const user = await requireRole(allowedRoles);
      const { threadId, messageId } = await params;

      await messageService.deleteSingleMessage(threadId, user.id, messageId);

      return ok({ deleted: true });
    },
    "messages:delete",
  );

  return {
    DELETE: withErrorHandler(handleDELETE),
  };
}

type ThreadListHandlerOptions = {
  allowedRoles: string[];
};

export function createThreadListHandler(options: ThreadListHandlerOptions) {
  const { allowedRoles } = options;

  const handleGET = withRateLimit(async () => {
    const user = await requireRole(allowedRoles);
    const threads = await messageService.getThreadList(user.id);
    return ok(threads);
  }, "messages:list");

  return {
    GET: withErrorHandler(handleGET),
  };
}
