/**
 * Job factory — creates real `job` rows in the test database.
 *
 * Defaults to `status: "active"` and `isActive: true` so the job passes the
 * dual-gate check in public queries (recruiter status AND admin kill-switch).
 *
 * @param recruiterId - ID of an existing recruiter user.
 * @param companyId   - ID of an existing company owned by that recruiter.
 */
import { faker } from "@faker-js/faker";
import type { Prisma } from "../../../app/generated/prisma/client";
import { WorkMode, EmploymentType } from "../../../app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function createTestJob(
  recruiterId: string,
  companyId: string,
  overrides?: Partial<Prisma.JobUncheckedCreateInput>,
) {
  const title = overrides?.title ?? faker.person.jobTitle();
  const slug = overrides?.slug ?? slugify(title);
  return prisma.job.create({
    data: {
      id: overrides?.id ?? faker.string.uuid(),
      slug,
      recruiterId,
      companyId,
      title,
      description: overrides?.description ?? faker.lorem.paragraphs(2),
      locations: overrides?.locations ?? [faker.location.city()],
      workMode: overrides?.workMode ?? WorkMode.remote,
      employmentType: overrides?.employmentType ?? EmploymentType.full_time,
      timezone: overrides?.timezone ?? "UTC",
      skills: overrides?.skills ?? [faker.word.noun(), faker.word.noun()],
      tags: overrides?.tags ?? [],
      experienceLevel: overrides?.experienceLevel ?? "mid",
      salaryMin: overrides?.salaryMin ?? 50000,
      salaryMax: overrides?.salaryMax ?? 80000,
      salaryCurrency: overrides?.salaryCurrency ?? "USD",
      status: overrides?.status ?? "active",
      isActive: overrides?.isActive ?? true,
      viewCount: overrides?.viewCount ?? 0,
      ...overrides,
    },
  });
}
