import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { messageService } from "@/lib/services/message-service";

async function handleGET() {
  const currentUser = await requireRole(["recruiter", "user"]);

  const threads = await messageService.getThreadList(currentUser.id);

  return ok(threads);
}

export const GET = withErrorHandler(handleGET);
