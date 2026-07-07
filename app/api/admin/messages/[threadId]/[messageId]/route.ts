import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { messageService } from "@/lib/services/message-service";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string; messageId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId, messageId } = await params;

  await messageService.deleteSingleMessage(threadId, adminUser.id, messageId);

  return ok({ deleted: true });
}

export const DELETE = withErrorHandler(handleDELETE);
