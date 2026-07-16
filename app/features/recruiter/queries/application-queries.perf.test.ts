import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb, createTestUser, createTestCompany, createTestJob, seedApplications } from "@/lib/test";
import { measure } from "@/lib/test/perf";
import { Role } from "@/app/generated/prisma/client";

describe("PF2 — Applicant list 10K+ records performance", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("pagination returns within 1000ms for 10k applicants", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    await seedApplications(job.id, company.id, { count: 10_000 });

    const { listApplicants } = await import(
      "@/app/features/recruiter/queries/application-queries"
    );

    const { ms, result } = await measure(() =>
      listApplicants(job.id, company.id, { page: 1, pageSize: 100, sortBy: "appliedAt", sortOrder: "desc" }),
    );

    expect(ms).toBeLessThanOrEqual(1000);
    expect(result.total).toBe(10_000);
  });
});
