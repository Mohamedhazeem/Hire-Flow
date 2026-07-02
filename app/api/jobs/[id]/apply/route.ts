import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { ApplySchema } from "@/app/features/jobs/schema/application-submit.schema";
import { createNotification, triggerForCompany } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";

async function handlePOST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["user"]);
  const { id: jobId } = await params;

  checkRateLimit(`apply:${session.id}`, { max: 10, windowMs: 60000 });

  const body = await request.json().catch(() => ({}));
  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const { resumeId, coverLetter } = parsed.data;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { status: true, isActive: true, applicationDeadline: true, recruiterId: true, companyId: true },
  });

  if (!job) throw new NotFoundError("Job not found");
  if (job.status !== "active" || !job.isActive) {
    throw new ValidationError("This job is no longer accepting applications");
  }

  const now = new Date();
  if (job.applicationDeadline && new Date(job.applicationDeadline) < now) {
    throw new ValidationError("The application deadline has passed");
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId: session.id } },
  });
  if (existing) {
    throw new ConflictError("You have already applied to this job");
  }

  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== session.id) {
    throw new NotFoundError("Resume not found");
  }
  if (resume.deletedAt) {
    throw new NotFoundError("Resume not found");
  }

  const resumeSnapshotUrl: string | undefined = resume.fileUrl ?? undefined;
  const resumeSnapshotBuilderData = resume.builderData ?? undefined;

  const application = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        jobId,
        userId: session.id,
        resumeId,
        resumeSnapshotUrl,
        resumeSnapshotBuilderData,
      },
    });

    await tx.applicationStatusChange.create({
      data: {
        applicationId: app.id,
        fromStatus: "applied",
        toStatus: "applied",
        changedById: session.id,
      },
    });

    return app;
  });

  await createNotification(
    job.recruiterId,
    "application_status",
    {
      applicationId: application.id,
      jobId,
      jobTitle: null,
      status: "applied",
      applicantName: session.name,
      message: coverLetter
        ? `${session.name} applied to your job with a cover letter`
        : `${session.name} applied to your job`,
    },
  );

  await triggerForCompany(
    job.companyId,
    "application_status",
    {
      applicationId: application.id,
      jobId,
      status: "applied",
      applicantName: session.name,
    },
    { excludeUserId: job.recruiterId },
  );

  revalidatePath("/jobs");
  revalidatePath("/user/applications");

  return ok({ id: application.id, status: "applied" }, 201);
}

export const POST = withErrorHandler(handlePOST);
