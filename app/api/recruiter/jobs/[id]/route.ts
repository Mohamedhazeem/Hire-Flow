import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api-error";
import { JobUpdateSchema } from "@/app/features/recruiter/schema/job.schema";
import { getJobById } from "@/app/features/recruiter/queries/job-queries";

async function handleGET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id } = await params;

  const existing = await prisma.job.findUnique({
    where: { id },
    select: { id: true, companyId: true, status: true },
  });

  if (!existing) {
    throw new NotFoundError("Job not found");
  }

  if (existing.companyId !== companyId) {
    throw new ForbiddenError("You do not have access to this job");
  }

  if (existing.status === "archived") {
    throw new ValidationError("Archived jobs cannot be edited. Reactivate the job first.");
  }

  const body = await request.json();
  const parsed = JobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid job data");
  }

  const deadline = parsed.data.applicationDeadline
    ? new Date(parsed.data.applicationDeadline)
    : undefined;

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.locations !== undefined && { locations: parsed.data.locations }),
      ...(parsed.data.workMode !== undefined && { workMode: parsed.data.workMode }),
      ...(parsed.data.employmentType !== undefined && {
        employmentType: parsed.data.employmentType,
      }),
      ...(parsed.data.timezone !== undefined && {
        timezone: parsed.data.timezone || null,
      }),
      ...(parsed.data.skills !== undefined && { skills: parsed.data.skills }),
      ...(parsed.data.tags !== undefined && { tags: parsed.data.tags }),
      ...(parsed.data.experienceLevel !== undefined && {
        experienceLevel: parsed.data.experienceLevel,
      }),
      ...(parsed.data.salaryMin !== undefined && { salaryMin: parsed.data.salaryMin ?? null }),
      ...(parsed.data.salaryMax !== undefined && { salaryMax: parsed.data.salaryMax ?? null }),
      ...(parsed.data.salaryCurrency !== undefined && {
        salaryCurrency: parsed.data.salaryCurrency,
      }),
      ...(deadline !== undefined && { applicationDeadline: deadline }),
    },
  });

  return ok({ job });
}

async function handleDELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const force = searchParams.get("force") === "true";

  const existing = await prisma.job.findUnique({
    where: { id },
    select: { id: true, companyId: true, status: true },
  });

  if (!existing) {
    throw new NotFoundError("Job not found");
  }

  if (existing.companyId !== companyId) {
    throw new ForbiddenError("You do not have access to this job");
  }

  let hardDeleted = false;

  if (existing.status === "draft" || force) {
    await prisma.job.delete({ where: { id } });
    hardDeleted = true;
  } else {
    await prisma.job.update({
      where: { id },
      data: { status: "archived" },
    });
  }

  return ok({ deleted: true, hardDeleted });
}

export const GET = withErrorHandler(handleGET);
export const PATCH = withErrorHandler(handlePATCH);
export const DELETE = withErrorHandler(handleDELETE);
