import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { messageService } from "@/lib/services/message-service";

async function handleGET() {
  const adminUser = await requireRole(["admin", "super_admin"]);

  const threads = await messageService.getThreadList(adminUser.id);

  return ok(threads);
}

export const GET = withErrorHandler(handleGET);
