/**
 * Resume factory — creates real `resume` rows in the test database.
 *
 * Defaults to `isPrimary: false` — tests that need a primary resume must
 * pass `{ isPrimary: true }` explicitly, making the intent clear.
 *
 * @param userId - ID of an existing user who owns the resume.
 */
import { faker } from "@faker-js/faker";
import type { Prisma } from "../../../app/generated/prisma/client";
import { testDb } from "../test-db";

export async function createTestResume(
  userId: string,
  overrides?: Partial<Prisma.ResumeUncheckedCreateInput>
) {
  return testDb.resume.create({
    data: {
      id: overrides?.id ?? faker.string.uuid(),
      userId,
      label: overrides?.label ?? "My Resume",
      fileUrl: overrides?.fileUrl ?? null,
      fileName: overrides?.fileName ?? null,
      fileSize: overrides?.fileSize ?? null,
      fileType: overrides?.fileType ?? null,
      builderData: overrides?.builderData ?? undefined,
      isPrimary: overrides?.isPrimary ?? false,
      ...overrides,
    },
  });
}
