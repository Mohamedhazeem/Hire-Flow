/**
 * Application factory — creates real `application` rows in the test database.
 *
 * Defaults to `status: "applied"` (first pipeline stage).
 *
 * @param jobId  - ID of an existing job.
 * @param userId - ID of an existing user (applicant).
 */
import { faker } from "@faker-js/faker";
import type { Prisma } from "../../../app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function createTestApplication(
  jobId: string,
  userId: string,
  overrides?: Partial<Prisma.ApplicationUncheckedCreateInput>
) {
  return prisma.application.create({
    data: {
      id: overrides?.id ?? faker.string.uuid(),
      jobId,
      userId,
      status: overrides?.status ?? "applied",
      rejectionReason: overrides?.rejectionReason ?? null,
      recruiterNote: overrides?.recruiterNote ?? null,
      interviewDate: overrides?.interviewDate ?? null,
      meetingLink: overrides?.meetingLink ?? null,
      offerDetails: overrides?.offerDetails ?? null,
      resumeId: overrides?.resumeId ?? null,
      resumeSnapshotUrl: overrides?.resumeSnapshotUrl ?? null,
      resumeSnapshotBuilderData: overrides?.resumeSnapshotBuilderData ?? undefined,
      ...overrides,
    },
  });
}
