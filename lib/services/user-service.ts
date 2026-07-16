import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/api/api-error";
import { createNotification } from "@/lib/notifications";
import { applicationRepository } from "@/lib/repositories/application-repository";

export const userService = {
  async withdrawApplication(applicationId: string, userId: string) {
    const application = await applicationRepository.findByApplicationId(applicationId);
    if (!application || application.userId !== userId) {
      throw new NotFoundError("Application not found");
    }

    if (application.status !== "applied" && application.status !== "reviewing") {
      throw new ValidationError(
        "Can only withdraw applications that are in 'applied' or 'reviewing' status",
      );
    }

    const { jobId, status } = application;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { recruiterId: true, title: true },
    });

    // A4: record an audit trail before hard-deleting the application so the
    // state mutation is never lost. Wrapped in a transaction so the audit row
    // and the delete are atomic (withdraw race safety, C4).
    await prisma.$transaction([
      prisma.applicationStatusChange.create({
        data: {
          applicationId,
          fromStatus: status,
          toStatus: "withdrawn",
          changedById: userId,
        },
      }),
      prisma.application.delete({ where: { id: applicationId } }),
    ]);

    if (job) {
      void createNotification(job.recruiterId, "application_status", {
        applicationId,
        jobId,
        jobTitle: job.title,
        status: "withdrawn",
      });
    }
  },

  async toggleBookmark(userId: string, jobId: string) {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false, id: existing.id };
    }

    const created = await prisma.bookmark.create({
      data: { userId, jobId },
    });
    return { bookmarked: true, id: created.id };
  },
};
