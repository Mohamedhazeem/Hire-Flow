import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { listAdminInvites } from "@/app/features/admin/queries/invite-queries";

async function handleGET() {
  await requireRole(["admin", "super_admin"]);
  const data = await listAdminInvites();
  return ok(data);
}

export const GET = withErrorHandler(withRateLimit(handleGET, "admin:invite:list"));
