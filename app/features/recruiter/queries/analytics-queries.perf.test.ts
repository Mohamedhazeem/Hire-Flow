import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb, createTestUser, createTestCompany, createTestJob, seedApplications } from "@/lib/test";
import { measure } from "@/lib/test/perf";
import { Role } from "@/app/generated/prisma/client";

describe("PF1 — Analytics 5-year range performance", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("completes within 5000ms for 50k applications across 5 years", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    await seedApplications(job.id, company.id, {
      count: 50_000,
      appliedAtSpreadDays: 365 * 5,
    });

    const { getAnalytics } = await import(
      "@/app/features/recruiter/queries/analytics-queries"
    );

    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const { ms } = await measure(() =>
      getAnalytics(company.id, {
        dateFrom: fiveYearsAgo.toISOString().slice(0, 10),
        dateTo: new Date().toISOString().slice(0, 10),
      }),
    );

    expect(ms).toBeLessThanOrEqual(5000);
  });
});
