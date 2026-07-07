import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api-wrapper";
import { applicationService } from "@/lib/services/application-service";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const recruiter = await requireRole(["recruiter"]);
  const { applicationId } = await params;

  const result = await applicationService.getProfileMinimal(applicationId, recruiter.id);
  return ok(result);
}

export const GET = withErrorHandler(handleGET);
