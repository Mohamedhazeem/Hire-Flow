import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { jobService } from "@/lib/services/job-service";

async function handleDELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;
  const result = await jobService.adminDelete(id);
  return ok(result);
}

async function handlePATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const result = await jobService.adminToggleStatus(id, body.isActive);
  return ok(result);
}

export const DELETE = withErrorHandler(handleDELETE);
export const PATCH = withErrorHandler(handlePATCH);
