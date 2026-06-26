import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import {
  StatusTransitionSchema,
  ALLOWED_TRANSITIONS,
} from "@/app/features/recruiter/schema/application.schema";
import { getApplicationById } from "@/app/features/recruiter/queries/application-queries";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";

async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { applicationId } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = StatusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Invalid status transition");
  }

  const { status, updatedAt } = parsed.data;

  const application = await getApplicationById(applicationId, companyId);
  if (!application) {
    throw new NotFoundError("Application not found");
  }

  const allowedTransitions = ALLOWED_TRANSITIONS[application.status];
  if (!allowedTransitions || !allowedTransitions.includes(status)) {
    throw new ValidationError(
      `Cannot transition from "${application.status}" to "${status}"`,
    );
  }

  // Optimistic concurrency: only update if updatedAt matches the client's version
  const concurrencyCheck = updatedAt
    ? new Date(updatedAt).toISOString()
    : application.updatedAt.toISOString();

  const updateData: Record<string, unknown> = {}

  updateData['status'] = status

  if (status === "rejected" && "rejectionReason" in parsed.data) {
    updateData['rejectionReason'] = (parsed.data as { rejectionReason: string }).rejectionReason;
  }

  if (status === "offered" && "offerDetails" in parsed.data) {
    updateData['offerDetails'] = (parsed.data as { offerDetails: string }).offerDetails;
  }

  if (status === "interview_scheduled" && "interviewDate" in parsed.data) {
    updateData['interviewDate'] = new Date((parsed.data as { interviewDate: string }).interviewDate);
    updateData['meetingLink'] = (parsed.data as { meetingLink?: string }).meetingLink ?? null;
  }

  const updated = await prisma.application.updateMany({
    where: {
      id: applicationId,
      updatedAt: concurrencyCheck,
    },
    data: updateData,
  });

  if (updated.count === 0) {
    throw new ConflictError(
      "This application was modified by another team member. Please refresh and try again.",
    );
  }

  // Create in-app notification for the applicant
  await prisma.notification.create({
    data: {
      userId: application.userId,
      type: "application_status",
      data: {
        applicationId: application.id,
        jobId: application.jobId,
        previousStatus: application.status,
        newStatus: status,
        updatedBy: session.id,
      },
    },
  });

  return ok({ success: true, status });
}

export const PATCH = withErrorHandler(handlePATCH);
