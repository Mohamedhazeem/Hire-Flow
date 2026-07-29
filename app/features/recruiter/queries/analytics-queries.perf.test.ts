import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  resetDb,
  createTestUser,
  createTestCompany,
  createTestJob,
  seedApplications,
  createTestApplication,
} from "@/lib/test";
import { measure } from "@/lib/test/perf";
import { Role, WorkMode, EmploymentType } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ANALYTICS_TIMEOUT = 120000;

describe("PF1 — Analytics performance and correctness", { timeout: ANALYTICS_TIMEOUT }, () => {
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

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

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

  it("returns correct totals for 10k applications with status filter", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    const userIds = await seedApplications(job.id, company.id, {
      count: 10_000,
      statuses: ["applied", "reviewing", "hired", "rejected", "withdrawn"],
    });

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, { status: "hired" });

    expect(result.summary.totalApplications).toBeGreaterThan(0);
    expect(result.summary.totalHired).toBe(result.summary.totalApplications);
    expect(result.applicationsByStatus.find((s) => s.stage === "rejected")?.count ?? 0).toBe(0);
    expect(result.summary.totalJobs).toBeGreaterThanOrEqual(1);
  });

  it("returns empty data for date range with no matches", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    await seedApplications(job.id, company.id, { count: 100 });

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, {
      dateFrom: "2010-01-01",
      dateTo: "2010-01-31",
    });

    expect(result.summary.totalApplications).toBe(0);
    expect(result.summary.totalHired).toBe(0);
    expect(result.applicationsByStatus.every((s) => s.count === 0)).toBe(true);
    expect(result.funnelHistorical).toEqual([]);
    expect(result.stageConversions).toEqual([]);
  });

  it("applies workMode filter correctly", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const remoteJob = await createTestJob(recruiter.id, company.id, { workMode: WorkMode.remote });
    const onsiteJob = await createTestJob(recruiter.id, company.id, { workMode: WorkMode.onsite });
    await seedApplications(remoteJob.id, company.id, { count: 50, appliedAtSpreadDays: 30 });
    await seedApplications(onsiteJob.id, company.id, { count: 50, appliedAtSpreadDays: 30 });

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, { workMode: "remote" });

    expect(result.summary.totalApplications).toBe(50);
    expect(result.applicationsByWorkMode).toHaveLength(1);
    expect(result.applicationsByWorkMode[0].workMode).toBe("remote");
  });

  it("applies employmentType filter correctly", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const ftJob = await createTestJob(recruiter.id, company.id, { employmentType: EmploymentType.full_time });
    const ptJob = await createTestJob(recruiter.id, company.id, { employmentType: EmploymentType.part_time });
    await seedApplications(ftJob.id, company.id, { count: 75, appliedAtSpreadDays: 30 });
    await seedApplications(ptJob.id, company.id, { count: 25, appliedAtSpreadDays: 30 });

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, { employmentType: "part_time" });

    expect(result.summary.totalApplications).toBe(25);
    expect(result.applicationsByEmploymentType).toHaveLength(1);
    expect(result.applicationsByEmploymentType[0].employmentType).toBe("part_time");
  });

  it("applies location (array overlap) filter correctly", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const nyJob = await createTestJob(recruiter.id, company.id, { locations: ["New York"] });
    const sfJob = await createTestJob(recruiter.id, company.id, { locations: ["San Francisco"] });
    await seedApplications(nyJob.id, company.id, { count: 30, appliedAtSpreadDays: 30 });
    await seedApplications(sfJob.id, company.id, { count: 70, appliedAtSpreadDays: 30 });

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, { location: "New York" });

    expect(result.summary.totalApplications).toBe(30);
  });

  it("returns funnel and conversion data when status changes exist", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    const applicant = await createTestUser({ role: Role.user });
    const app = await createTestApplication(job.id, applicant.id, { status: "hired" });

    const changeRecords = [
      { applicationId: app.id, fromStatus: "", toStatus: "applied" },
      { applicationId: app.id, fromStatus: "applied", toStatus: "reviewing" },
      { applicationId: app.id, fromStatus: "reviewing", toStatus: "shortlisted" },
      { applicationId: app.id, fromStatus: "shortlisted", toStatus: "interview_scheduled" },
      { applicationId: app.id, fromStatus: "interview_scheduled", toStatus: "offered" },
      { applicationId: app.id, fromStatus: "offered", toStatus: "hired" },
    ];

    for (const c of changeRecords) {
      await prisma.applicationStatusChange.create({
        data: { ...c, changedById: recruiter.id },
      });
    }

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, {});

    expect(result.funnelHistorical.length).toBeGreaterThan(0);
    expect(result.stageConversions.length).toBeGreaterThan(0);
    expect(result.funnelCurrent.find((s) => s.stage === "hired")?.count).toBe(1);
  });

  it("returns avgFulfillmentDays as null when no hires", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    await seedApplications(job.id, company.id, { count: 100, statuses: ["applied", "reviewing"] });

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, {});

    expect(result.summary.avgFulfillmentDays).toBeNull();
  });

  it("returns all jobs in jobBreakdown even with status filter applied", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const jobA = await createTestJob(recruiter.id, company.id, { title: "Alpha" });
    const jobB = await createTestJob(recruiter.id, company.id, { title: "Beta" });
    await seedApplications(jobA.id, company.id, { count: 50, statuses: ["applied"] });
    await seedApplications(jobB.id, company.id, { count: 100, statuses: ["hired"] });

    const { getAnalytics } = await import("@/app/features/recruiter/queries/analytics-queries");

    const result = await getAnalytics(company.id, { status: "hired" });

    expect(result.jobBreakdown).toHaveLength(2);
    expect(result.jobBreakdown.find((j) => j.title === "Alpha")?.totalApplications).toBe(0);
    expect(result.jobBreakdown.find((j) => j.title === "Beta")?.totalApplications).toBeGreaterThan(0);
  });
});
