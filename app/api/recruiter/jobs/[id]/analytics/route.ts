import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { AnalyticsFilterSchema } from "@/app/features/recruiter/schema/analytics.schema";
import { getJobAnalytics } from "@/app/features/recruiter/queries/analytics-queries";

async function handleGET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id: jobId } = await params;
  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  const filter = AnalyticsFilterSchema.parse(searchParams);
  const data = await getJobAnalytics(companyId, jobId, filter);
  return ok(data);
}

export const GET = withErrorHandler(withRateLimit(handleGET, "recruiter:jobs:analytics"));
