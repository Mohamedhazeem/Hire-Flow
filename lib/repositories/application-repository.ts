import { prisma } from "@/lib/prisma";

export const applicationRepository = {
  findByApplicationId(applicationId: string) {
    return prisma.application.findUnique({
      where: { id: applicationId },
    });
  },

  findByApplicationIdWithCompany(applicationId: string, companyId: string) {
    return prisma.application.findFirst({
      where: { id: applicationId, job: { companyId } },
      select: { id: true, userId: true, jobId: true, status: true },
    });
  },

  findByIdWithAuthProfile(applicationId: string, recruiterId: string) {
    return prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        userId: true,
        job: {
          select: {
            recruiterId: true,
            company: {
              select: {
                teamMembers: { where: { userId: recruiterId }, select: { userId: true } },
              },
            },
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });
  },

  findIdsByCompany(applicationIds: string[], companyId: string) {
    return prisma.application.findMany({
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
  },

  findByJobAndUser(jobId: string, userId: string) {
    return prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
  },

  updateWithConcurrency(
    applicationId: string,
    updatedAt: string,
    data: Record<string, unknown>,
  ) {
    return prisma.application.updateMany({
      where: {
        id: applicationId,
        updatedAt,
      },
      data,
    });
  },

  updateStatus(
    applicationId: string,
    data: Record<string, unknown>,
  ) {
    return prisma.application.update({
      where: { id: applicationId },
      data,
    });
  },

  create(data: Record<string, unknown>) {
    return prisma.application.create({ data } as never);
  },

  deleteById(applicationId: string) {
    return prisma.application.delete({ where: { id: applicationId } });
  },

  async updateManyWithConcurrency(
    applicationIds: string[],
    data: Record<string, unknown>,
  ) {
    return prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data,
    });
  },

  findStatusChangesByApplicationId(applicationId: string) {
    return prisma.applicationStatusChange.findFirst({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });
  },

  createStatusChange(data: {
    applicationId: string;
    fromStatus: string;
    toStatus: string;
    changedById: string;
    note?: string | null;
  }) {
    return prisma.applicationStatusChange.create({ data });
  },

  createManyStatusChanges(
    data: Array<{
      applicationId: string;
      fromStatus: string;
      toStatus: string;
      changedById: string;
      note?: string | null;
    }>,
  ) {
    return prisma.applicationStatusChange.createMany({ data });
  },
};
