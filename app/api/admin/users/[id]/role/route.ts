import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { userAdminService } from "@/lib/services/user-admin-service";

async function handlePOST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const result = await userAdminService.setRole(id, body.role, request.headers);

  return ok(result);
}

export const POST = withErrorHandler(withRateLimit(handlePOST, "admin:users:manage"));
