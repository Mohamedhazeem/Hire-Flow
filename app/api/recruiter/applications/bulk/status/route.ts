import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import {
  BulkStatusTransitionSchema,
  ALLOWED_TRANSITIONS,
} from "@/app/features/recruiter/schema/application.schema";
import { NotFoundError, ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";

async function handlePOST(request: NextRequest) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const body = await request.json().catch(() => ({}));
  const parsed = BulkStatusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { applicationIds, status, rejectionReason, email } = parsed.data;

  const applications = await prisma.application.findMany({
    where: {
      id: { in: applicationIds },
      job: { companyId },
    },
    select: {
      id: true,
      userId: true,
      jobId: true,
      status: true,
      updatedAt: true,
      user: { select: { email: true } },
    },
  });

  if (applications.length !== applicationIds.length) {
    throw new NotFoundError(
      `${applications.length} of ${applicationIds.length} applications found. Some applications do not exist or do not belong to your company.`,
    );
  }

  for (const app of applications) {
    const allowedTransitions = ALLOWED_TRANSITIONS[app.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      throw new ValidationError(
        `Application ${app.id}: cannot transition from "${app.status}" to "${status}"`,
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = { status, updatedAt: new Date() };
    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await tx.application.updateMany({
      where: { id: { in: applicationIds } },
      data: updateData,
    });

    await tx.applicationStatusChange.createMany({
      data: applications.map((a) => ({
        applicationId: a.id,
        fromStatus: a.status,
        toStatus: status,
        changedById: session.id,
        note: status === "rejected" ? (rejectionReason ?? null) : null,
      })),
    });

    await tx.notification.createMany({
      data: applications.map((a) => ({
        userId: a.userId,
        type: "application_status",
        data: {
          applicationId: a.id,
          jobId: a.jobId,
          previousStatus: a.status,
          newStatus: status,
          updatedBy: session.id,
          pendingEmail: email,
        },
      })),
    });
  });

  return ok({ count: applications.length, status });
}

export const POST = withErrorHandler(handlePOST);
