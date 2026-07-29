import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { userAdminService } from "@/lib/services/user-admin-service";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["super_admin"]);
  const { id } = await params;

  const result = await userAdminService.removeAdminMember(id, session.id);
  return ok(result);
}

export const DELETE = withErrorHandler(handleDELETE);
