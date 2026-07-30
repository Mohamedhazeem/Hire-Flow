import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { ok } from "@/lib/api/api-response";
import { getDashboardStats } from "@/app/features/admin/queries/dashboard-queries";
import { requireRole } from "@/app/features/shared/api/require-role";

async function handleGET() {
  await requireRole(["admin", "super_admin"]);
  const stats = await getDashboardStats();
  return ok(stats);
}

export const GET = withErrorHandler(withRateLimit(handleGET, "admin:dashboard"));
