import { withErrorHandler } from "@/lib/api-wrapper";
import { ok } from "@/lib/api-response";
import { getDashboardStats } from "@/app/features/admin/queries/dashboard-queries";
import { requireAdmin } from "@/app/features/admin/api/require-admin";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const stats = await getDashboardStats();
  return ok(stats);
});
