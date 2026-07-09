import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/api/api-error";

export async function verifyRecruiterApplicantRelationship(
  recruiterId: string,
  applicantId: string,
): Promise<void> {
  const application = await prisma.application.findFirst({
    where: {
      userId: applicantId,
      job: {
        OR: [{ recruiterId }, { company: { teamMembers: { some: { userId: recruiterId } } } }],
      },
    },
    select: { id: true },
  });

  if (!application) {
    throw new ForbiddenError("This applicant has not applied to any job at your company");
  }
}
