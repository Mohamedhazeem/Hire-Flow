import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/api/api-error";

export async function verifyRecruiterApplicantRelationship(
  recruiterId: string,
  otherUserId: string,
): Promise<void> {
  // Allow communication with admins/super_admins — they can initiate threads
  // with any user, and this is the only way recruiters can reply to those
  // threads (the admin never applies to a recruiter's jobs).
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { role: true },
  });
  if (otherUser?.role === "admin" || otherUser?.role === "super_admin") return;

  const application = await prisma.application.findFirst({
    where: {
      userId: otherUserId,
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
