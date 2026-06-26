import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { NotFoundError, ValidationError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";

async function handlePOST(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { applicationId } = await params;

  const result = await prisma.$transaction(async (tx) => {
    const application = await tx.application.findFirst({
      where: { id: applicationId, job: { companyId } },
      select: { id: true, userId: true, jobId: true, status: true },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    const lastChange = await tx.applicationStatusChange.findFirst({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });

    if (!lastChange) {
      throw new ValidationError("No previous status change to revert");
    }

    const revertToStatus = lastChange.fromStatus;

    const updateData: Record<string, unknown> = { status: revertToStatus };

    if (application.status === "rejected") {
      updateData.rejectionReason = null;
    }

    await tx.application.update({
      where: { id: applicationId },
      data: updateData,
    });

    await tx.applicationStatusChange.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus: revertToStatus,
        changedById: session.id,
        note: "Reverted",
      },
    });

    return revertToStatus;
  });

  return ok({ status: result });
}

export const POST = withErrorHandler(handlePOST);
