import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { messageService } from "@/lib/services/message-service";

async function handleGET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId } = await params;
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 30;

  const result = await messageService.getMessages({ threadId, userId: adminUser.id, cursor, limit });
  return ok(result);
}

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId } = await params;
  const body = await request.json();

  const message = await messageService.sendMessage({
    threadId,
    senderId: adminUser.id,
    senderName: adminUser.name,
    senderRole: adminUser.role,
    body,
    requireValidUrl: true,
  });

  return ok(message, 201);
}

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId } = await params;

  await messageService.deleteMyMessages(threadId, adminUser.id);

  return ok({ deleted: true });
}

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
export const DELETE = withErrorHandler(handleDELETE);
