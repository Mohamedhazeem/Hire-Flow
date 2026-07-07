import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { userAdminService } from "@/lib/services/user-admin-service";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const { id } = await params;

  const result = await userAdminService.removeRecruiterMember(id, session.id, session.memberRole);
  return ok(result);
}

export const DELETE = withErrorHandler(handleDELETE);
