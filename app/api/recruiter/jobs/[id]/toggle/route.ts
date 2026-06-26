import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api-error";
import { RecruiterToggleJobStatusSchema } from "@/app/features/recruiter/schema/job.schema";

async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id } = await params;

  const body = await request.json();
  const parsed = RecruiterToggleJobStatusSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid status value");
  }

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

  const newStatus = parsed.data.status;

  if (newStatus === "active" && existing.status !== "draft") {
    throw new ValidationError(
      existing.status === "archived"
        ? "Use the edit form to reactivate an archived job."
        : "Job is already active.",
    );
  }

  if (newStatus === "archived" && existing.status !== "active") {
    throw new ValidationError(
      existing.status === "draft"
        ? "Cannot archive a draft job. Publish it first."
        : "Job is already archived.",
    );
  }

  const job = await prisma.job.update({
    where: { id },
    data: { status: newStatus, isActive: newStatus === "active" },
  });

  return ok({ job });
}

export const PATCH = withErrorHandler(handlePATCH);
