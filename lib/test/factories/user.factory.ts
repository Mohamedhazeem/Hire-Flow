/**
 * User factory — creates real `user` rows in the test database.
 */
import { faker } from "@faker-js/faker";
import type { Prisma } from "../../../app/generated/prisma/client";
import { Role } from "../../../app/generated/prisma/client";
import { testDb } from "../test-db";

export async function createTestUser(
  overrides?: Partial<Prisma.UserUncheckedCreateInput>
) {
  const email = overrides?.email ?? faker.internet.email();

  return testDb.user.create({
    data: {
      id: overrides?.id ?? faker.string.uuid(),
      name: overrides?.name ?? faker.person.fullName(),
      email: (email as string).toLowerCase(),
      emailVerified: overrides?.emailVerified ?? true,
      role: overrides?.role ?? Role.user,
      banned: overrides?.banned ?? false,
      banReason: overrides?.banReason ?? null,
      banExpiresAt: overrides?.banExpiresAt ?? null,
      image: overrides?.image ?? null,
      ...overrides,
    },
  });
}
