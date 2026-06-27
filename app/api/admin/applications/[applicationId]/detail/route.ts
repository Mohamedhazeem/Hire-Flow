import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { getAdminApplicantDetail } from "@/app/features/admin/queries/applicant-queries";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { applicationId } = await params;
  const detail = await getAdminApplicantDetail(applicationId);
  return ok(detail);
}

export const GET = withErrorHandler(handleGET);
