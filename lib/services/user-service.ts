import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/api-error";
import { createNotification } from "@/lib/notifications";
import { applicationRepository } from "@/lib/repositories/application-repository";

export const userService = {
  async withdrawApplication(applicationId: string, userId: string) {
    const application = await applicationRepository.findByApplicationId(applicationId);
    if (!application || application.userId !== userId) {
      throw new NotFoundError("Application not found");
    }

    if (application.status !== "applied" && application.status !== "reviewing") {
      throw new ValidationError("Can only withdraw applications that are in 'applied' or 'reviewing' status");
    }

    const { jobId } = application;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { recruiterId: true, title: true },
    });

    await applicationRepository.deleteById(applicationId);

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
