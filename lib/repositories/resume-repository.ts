import { prisma } from "@/lib/prisma";

export const resumeRepository = {
  findById(resumeId: string) {
    return prisma.resume.findUnique({ where: { id: resumeId } });
  },
};
