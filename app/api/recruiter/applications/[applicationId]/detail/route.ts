import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { getApplicantDetail } from "@/app/features/recruiter/libs/get-applicant-detail";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { applicationId } = await params;
  const detail = await getApplicantDetail(applicationId, companyId, session.id);
  return ok(detail);
}

export const GET = withErrorHandler(handleGET);
