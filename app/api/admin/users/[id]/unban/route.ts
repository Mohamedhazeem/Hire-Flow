import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { userAdminService } from "@/lib/services/user-admin-service";
import { withErrorHandler } from "@/lib/api/api-wrapper";

async function handlePOST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const result = await userAdminService.unbanUser(id);

  return ok(result);
}

export const POST = withErrorHandler(handlePOST);
