import { NotFoundError, ValidationError, ConflictError } from "@/lib/api/api-error";
import { prisma } from "@/lib/prisma";
import {
  createNotification,
  createNotificationsBulk,
  triggerForCompany,
  fireNotification,
} from "@/lib/notifications";
import { getApplicationById } from "@/app/features/recruiter/queries/application-queries";
import { ALLOWED_TRANSITIONS } from "@/app/features/recruiter/schema/application.schema";
import { applicationRepository } from "@/lib/repositories/application-repository";
import { jobRepository } from "@/lib/repositories/job-repository";
import { resumeRepository } from "@/lib/repositories/resume-repository";

export const applicationService = {
  async transitionStatus(
    applicationId: string,
    companyId: string,
    sessionId: string,
    sessionName: string,
    body: Record<string, unknown>,
  ) {
    const { status, updatedAt } = body;
    const parsedStatus = status as string;

    const application = await getApplicationById(applicationId, companyId);
    if (!application) {
      throw new NotFoundError("Application not found");
    }

    const allowedTransitions = ALLOWED_TRANSITIONS[application.status];
    if (!allowedTransitions || !allowedTransitions.includes(parsedStatus)) {
      throw new ValidationError(
        `Cannot transition from "${application.status}" to "${parsedStatus}"`,
      );
    }

    const concurrencyCheck = updatedAt
      ? new Date(updatedAt as string).toISOString()
      : application.updatedAt.toISOString();

    const updateData: Record<string, unknown> = {};
    updateData.status = parsedStatus;

    if (parsedStatus === "rejected" && "rejectionReason" in body) {
      updateData.rejectionReason = (body as { rejectionReason: string }).rejectionReason;
    }

    if (parsedStatus === "offered" && "offerDetails" in body) {
      updateData.offerDetails = (body as { offerDetails: string }).offerDetails;
    }

    if (parsedStatus === "interview_scheduled" && "interviewDate" in body) {
      updateData.interviewDate = new Date((body as { interviewDate: string }).interviewDate);
      updateData.meetingLink = (body as { meetingLink?: string }).meetingLink ?? null;
    }

    const updated = await applicationRepository.updateWithConcurrency(
      applicationId,
      concurrencyCheck,
      updateData,
    );

    if (updated.count === 0) {
      throw new ConflictError(
        "This application was modified by another team member. Please refresh and try again.",
      );
    }

    await applicationRepository.createStatusChange({
      applicationId,
      fromStatus: application.status,
      toStatus: parsedStatus,
      changedById: sessionId,
      note:
        ("rejectionReason" in body
          ? (body as { rejectionReason: string }).rejectionReason
          : undefined) ??
        ("offerDetails" in body ? (body as { offerDetails: string }).offerDetails : undefined) ??
        null,
    });

    fireNotification(
      createNotification(application.userId, "application_status", {
        applicationId: application.id,
        jobId: application.jobId,
        previousStatus: application.status,
        newStatus: parsedStatus,
        updatedBy: sessionId,
      }),
    );

    return { success: true, status: parsedStatus };
  },

  async bulkTransitionStatus(
    companyId: string,
    sessionId: string,
    body: {
      applicationIds: string[];
      status: string;
      rejectionReason?: string;
      email?: boolean;
    },
  ) {
    const { applicationIds, status, rejectionReason, email } = body;

    const result = await prisma.$transaction(async (tx) => {
      const applications = await tx.application.findMany({
        where: {
          id: { in: applicationIds },
          job: { companyId },
        },
        select: {
          id: true,
          userId: true,
          jobId: true,
          status: true,
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

      const updateData: Record<string, unknown> = { status };
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
          changedById: sessionId,
          note: status === "rejected" ? (rejectionReason ?? null) : null,
        })),
      });

      fireNotification(
        createNotificationsBulk(
          applications.map((a) => ({
            userId: a.userId,
            type: "application_status",
            data: {
              applicationId: a.id,
              jobId: a.jobId,
              previousStatus: a.status,
              newStatus: status,
              updatedBy: sessionId,
              pendingEmail: email,
            },
          })),
        ),
      );

      return { count: applications.length, status };
    });

    return result;
  },

  async revertStatus(applicationId: string, companyId: string, sessionId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const application = await applicationRepository.findByApplicationIdWithCompany(
        applicationId,
        companyId,
      );

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
          changedById: sessionId,
          note: "Reverted",
        },
      });

      fireNotification(
        createNotification(application.userId, "application_status", {
          applicationId,
          jobId: application.jobId,
          previousStatus: application.status,
          newStatus: revertToStatus,
          updatedBy: sessionId,
          note: "Reverted",
        }),
      );

      return revertToStatus;
    });

    return { status: result };
  },

  async getProfileMinimal(applicationId: string, recruiterId: string) {
    const application = await applicationRepository.findByIdWithAuthProfile(
      applicationId,
      recruiterId,
    );

    if (!application) throw new NotFoundError("Application not found");

    const isAuthorized =
      application.job.recruiterId === recruiterId || application.job.company.teamMembers.length > 0;

    if (!isAuthorized) throw new NotFoundError("Application not found");

    return {
      userId: application.userId,
      name: application.user.name,
      email: application.user.email,
    };
  },

  async applyToJob(
    jobId: string,
    userId: string,
    userName: string,
    body: { resumeId: string; coverLetter?: string },
  ) {
    const { resumeId, coverLetter } = body;

    const job = await jobRepository.findByIdWithGates(jobId);

    if (!job) throw new NotFoundError("Job not found");
    if (job.status !== "active" || !job.isActive) {
      throw new ValidationError("This job is no longer accepting applications");
    }

    const now = new Date();
    if (job.applicationDeadline && new Date(job.applicationDeadline) < now) {
      throw new ValidationError("The application deadline has passed");
    }

    const existing = await applicationRepository.findByJobAndUser(jobId, userId);
    if (existing) {
      throw new ConflictError("You have already applied to this job");
    }

    const resume = await resumeRepository.findById(resumeId);
    if (!resume || resume.userId !== userId) {
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
          userId,
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
          changedById: userId,
        },
      });

      return app;
    });

    await createNotification(job.recruiterId, "application_status", {
      applicationId: application.id,
      jobId,
      jobTitle: null,
      status: "applied",
      applicantName: userName,
      message: coverLetter
        ? `${userName} applied to your job with a cover letter`
        : `${userName} applied to your job`,
    });

    await triggerForCompany(
      job.companyId,
      "application_status",
      {
        applicationId: application.id,
        jobId,
        status: "applied",
        applicantName: userName,
      },
      { excludeUserId: job.recruiterId },
    );

    return { id: application.id, status: "applied" };
  },
};
