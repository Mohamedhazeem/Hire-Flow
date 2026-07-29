import { prisma } from "@/lib/prisma";

export const jobRepository = {
  findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });
  },

  findByIdWithGates(id: string) {
    return prisma.job.findUnique({
      where: { id },
      select: {
        status: true,
        isActive: true,
        applicationDeadline: true,
        recruiterId: true,
        companyId: true,
      },
    });
  },

  findOwnedBy(id: string, companyId: string) {
    return prisma.job.findUnique({
      where: { id },
      select: { id: true, companyId: true, status: true },
    });
  },

  create(data: Record<string, unknown>) {
    return prisma.job.create({ data } as never);
  },

  update(id: string, data: Record<string, unknown>) {
    return prisma.job.update({ where: { id }, data } as never);
  },

  delete(id: string) {
    return prisma.job.delete({ where: { id } });
  },

  incrementViewCount(id: string) {
    return prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },
};
