import { withErrorHandler } from "@/lib/api/api-wrapper";
import { ok } from "@/lib/api/api-response";
import { getDashboardStats } from "@/app/features/admin/queries/dashboard-queries";
import { requireRole } from "@/app/features/shared/api/require-role";

export const GET = withErrorHandler(async () => {
  await requireRole(["admin", "super_admin"]);
  const stats = await getDashboardStats();
  return ok(stats);
});
