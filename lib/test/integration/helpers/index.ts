import {
  createTestUser,
  createTestCompany,
  createTestJob,
  createTestApplication,
  createTestResume,
} from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";
import type { User, Company, Job, Application, Resume } from "@/app/generated/prisma/client";

export async function seedRecruiterCompany(): Promise<[User, Company, Job]> {
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  return [recruiter, company, job];
}

export async function seedUserApplication(): Promise<{ user: User; application: Application }> {
  const user = await createTestUser({ role: Role.user });
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  const application = await createTestApplication(job.id, user.id);
  return { user, application };
}

export async function seedResume(
  userId: string,
  overrides?: Partial<Parameters<typeof createTestResume>[1]>,
): Promise<Resume> {
  return createTestResume(userId, overrides);
}

export async function seedJobWithApplicant(): Promise<{
  recruiter: User;
  company: Company;
  job: Job;
  applicant: User;
  application: Application;
}> {
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  const applicant = await createTestUser({ role: Role.user });
  const application = await createTestApplication(job.id, applicant.id);
  return { recruiter, company, job, applicant, application };
}
