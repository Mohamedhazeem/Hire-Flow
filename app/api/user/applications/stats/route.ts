import { ok } from "@/lib/api/api-response";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { getUserApplicationStats } from "@/app/features/user/queries/user-application-queries";

async function handleGET() {
  const session = await requireRole(["user"]);
  const stats = await getUserApplicationStats(session.id);
  return ok(stats);
}

export const GET = withErrorHandler(handleGET);
