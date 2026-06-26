import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import {
  RecruiterListJobsParamsSchema,
  JobCreateSchema,
} from "@/app/features/recruiter/schema/job.schema";
import { listJobs } from "@/app/features/recruiter/queries/job-queries";
import { ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";

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

  const deadline = parsed.data.applicationDeadline
    ? new Date(parsed.data.applicationDeadline)
    : undefined;

  const job = await prisma.job.create({
    data: {
      recruiterId: session.id,
      companyId,
      title: parsed.data.title,
      description: parsed.data.description,
      locations: parsed.data.locations,
      workMode: parsed.data.workMode,
      employmentType: parsed.data.employmentType,
      timezone: parsed.data.timezone || null,
      skills: parsed.data.skills,
      tags: parsed.data.tags,
      experienceLevel: parsed.data.experienceLevel,
      salaryMin: parsed.data.salaryMin ?? null,
      salaryMax: parsed.data.salaryMax ?? null,
      salaryCurrency: parsed.data.salaryCurrency,
      applicationDeadline: deadline ?? null,
      status: "draft",
    },
  });

  return ok({ job }, 201);
}

export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);
