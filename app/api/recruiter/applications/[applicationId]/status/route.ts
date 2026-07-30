import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { StatusTransitionSchema } from "@/app/features/recruiter/schema/application.schema";
import { ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { applicationService } from "@/lib/services/application-service";

async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { applicationId } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = StatusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Invalid status transition");
  }

  const result = await applicationService.transitionStatus(
    applicationId,
    companyId,
    session.id,
    session.name,
    parsed.data as Record<string, unknown>,
  );

  return ok(result);
}

export const PATCH = withErrorHandler(withRateLimit(handlePATCH, "recruiter:applications:manage"));
