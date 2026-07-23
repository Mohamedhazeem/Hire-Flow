import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import { slugify } from "@/lib/slugify";

export async function seedApplications(
  jobId: string,
  companyId: string,
  config: {
    count: number;
    statuses?: string[];
    appliedAtSpreadDays?: number;
  },
): Promise<string[]> {
  const { count, statuses = ["applied", "reviewing", "shortlisted", "interview_scheduled", "offered", "hired", "rejected"], appliedAtSpreadDays = 365 } = config;
  const batchSize = 1000;
  const userIds: string[] = [];

  for (let batchStart = 0; batchStart < count; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, count);
    const batchSizeActual = batchEnd - batchStart;

    const userData = Array.from({ length: batchSizeActual }, (_, i) => {
      const globalIndex = batchStart + i;
      return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: `applicant-${globalIndex}-${faker.string.alphanumeric(8)}@example.com`,
        role: "user" as const,
        emailVerified: true,
      };
    });

    await prisma.user.createMany({ data: userData });
    userIds.push(...userData.map((u) => u.id));

    const appData = userData.map((u) => {
      const appliedAt = new Date();
      appliedAt.setDate(appliedAt.getDate() - Math.floor(Math.random() * appliedAtSpreadDays));
      return {
        id: faker.string.uuid(),
        jobId,
        userId: u.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        appliedAt,
      };
    });

    await prisma.application.createMany({ data: appData });
  }

  return userIds;
}

export async function seedJobs(
  companyId: string,
  recruiterId: string,
  count: number,
  keyword = "engineer",
  keywordRatio = 0.1,
): Promise<string[]> {
  const batchSize = 500;
  const jobIds: string[] = [];

  for (let batchStart = 0; batchStart < count; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, count);
    const batchSizeActual = batchEnd - batchStart;

    const jobData = Array.from({ length: batchSizeActual }, (_, i) => {
      const globalIndex = batchStart + i;
      const hasKeyword = globalIndex % Math.round(1 / keywordRatio) === 0;
      const id = faker.string.uuid();
      jobIds.push(id);
      const jobTitle = hasKeyword
        ? `${keyword} ${faker.person.jobTitle()}`
        : faker.person.jobTitle();
      return {
        id,
        slug: slugify(jobTitle),
        recruiterId,
        companyId,
        title: jobTitle,
        description: hasKeyword
          ? `${keyword} ${faker.lorem.paragraphs(3)}`
          : faker.lorem.paragraphs(3),
        locations: [faker.location.city()],
        workMode: "remote" as const,
        employmentType: "full_time" as const,
        timezone: "UTC",
        skills: [faker.word.noun(), faker.word.noun()],
        tags: [],
        experienceLevel: "mid",
        salaryMin: 50000,
        salaryMax: 80000,
        salaryCurrency: "USD",
        status: "active",
        isActive: true,
        viewCount: 0,
      };
    });

    await prisma.job.createMany({ data: jobData });
  }

  return jobIds;
}
