import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { ValidationError, NotFoundError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string; messageId: string }> },
) {
  const adminUser = await requireRole(["admin", "super_admin"]);
  const { threadId, messageId } = await params;

  const parts = threadId.split("_");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new ValidationError("Invalid thread ID format");
  }

  if (!threadId.includes(adminUser.id)) {
    throw new ValidationError("You are not a participant in this thread");
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, threadId: true },
  });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  if (message.threadId !== threadId) {
    throw new ValidationError("Message does not belong to this thread");
  }

  if (message.senderId !== adminUser.id) {
    throw new ValidationError("You can only delete your own messages");
  }

  await prisma.message.delete({
    where: { id: messageId },
  });

  return ok({ deleted: true });
}

export const DELETE = withErrorHandler(handleDELETE);
