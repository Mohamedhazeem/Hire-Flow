import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { NotFoundError, ValidationError } from "@/lib/api/api-error";
import { JobUpdateSchema } from "@/app/features/recruiter/schema/job.schema";
import { getJobById } from "@/app/features/recruiter/queries/job-queries";
import { jobService } from "@/lib/services/job-service";

async function handleGET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id } = await params;
  const job = await getJobById(id, companyId);

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  return ok({ job });
}

async function handlePATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id } = await params;

  const body = await request.json();
  const parsed = JobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid job data");
  }

  const result = await jobService.recruiterUpdateJob(
    id,
    companyId,
    parsed.data as Record<string, unknown>,
  );
  return ok(result);
}

async function handleDELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const force = searchParams.get("force") === "true";

  const result = await jobService.recruiterDeleteJob(id, companyId, force);
  return ok(result);
}

export const GET = withErrorHandler(withRateLimit(handleGET, "recruiter:jobs:list"));
export const PATCH = withErrorHandler(withRateLimit(handlePATCH, "recruiter:jobs:manage"));
export const DELETE = withErrorHandler(withRateLimit(handleDELETE, "recruiter:jobs:manage"));
