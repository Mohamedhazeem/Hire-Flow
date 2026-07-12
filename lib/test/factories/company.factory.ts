/**
 * Company factory — creates real `company` rows in the test database.
 *
 * @param recruiterId - The ID of an existing user with role "recruiter".
 */
import { faker } from "@faker-js/faker";
import type { Prisma } from "../../../app/generated/prisma/client";
import { testDb } from "../test-db";

export async function createTestCompany(
  recruiterId: string,
  overrides?: Partial<Prisma.CompanyUncheckedCreateInput>
) {
  return testDb.company.create({
    data: {
      id: overrides?.id ?? faker.string.uuid(),
      recruiterId,
      name: overrides?.name ?? faker.company.name(),
      logoUrl: overrides?.logoUrl ?? faker.image.url(),
      website: overrides?.website ?? faker.internet.url(),
      socialLinks: overrides?.socialLinks ?? {},
      description: overrides?.description ?? faker.company.catchPhrase(),
      industry: overrides?.industry ?? faker.company.buzzNoun(),
      ...overrides,
    },
  });
}
