import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { WorkMode, EmploymentType } from "@/app/generated/prisma/enums";
import {
  RecruiterListJobsParamsSchema,
  JobCreateSchema,
} from "@/app/features/recruiter/schema/job.schema";
import { listJobs } from "@/app/features/recruiter/queries/job-queries";
import { ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { jobService } from "@/lib/services/job-service";

async function handleGET(request: NextRequest) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { searchParams } = request.nextUrl;
  const params = RecruiterListJobsParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    workMode: searchParams.get("workMode") ?? undefined,
    employmentType: searchParams.get("employmentType") ?? undefined,
    experienceLevel: searchParams.get("experienceLevel") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  });

  if (!params.success) {
    throw new ValidationError("Invalid query parameters");
  }

  const result = await listJobs(companyId, params.data);
  return ok(result);
}

async function handlePOST(request: NextRequest) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const body = await request.json();
  const parsed = JobCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid job data");
  }

  const serviceInput = {
    ...parsed.data,
    workMode: parsed.data.workMode ?? WorkMode.remote,
    employmentType: parsed.data.employmentType ?? EmploymentType.full_time,
  };

  const result = await jobService.recruiterCreateJob(companyId, session.id, serviceInput);
  return ok(result, 201);
}

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
