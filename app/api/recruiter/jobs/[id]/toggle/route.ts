import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { ValidationError } from "@/lib/api/api-error";
import { RecruiterToggleJobStatusSchema } from "@/app/features/recruiter/schema/job.schema";
import { jobService } from "@/lib/services/job-service";

async function handlePATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id } = await params;

  const body = await request.json();
  const parsed = RecruiterToggleJobStatusSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid status value");
  }

  const result = await jobService.recruiterToggleStatus(id, companyId, parsed.data.status);
  return ok(result);
}

export const PATCH = withErrorHandler(withRateLimit(handlePATCH, "recruiter:jobs:manage"));
