import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { applicationService } from "@/lib/services/application-service";

async function handlePOST(_request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { applicationId } = await params;

  const result = await applicationService.revertStatus(applicationId, companyId, session.id);
  return ok(result);
}

export const POST = withErrorHandler(handlePOST);
