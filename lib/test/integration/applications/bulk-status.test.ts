import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser, createTestCompany, createTestJob, createTestApplication } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

async function seedJobWithApplicants(count: number) {
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  const applications = [];
  for (let i = 0; i < count; i++) {
    const applicant = await createTestUser({ role: Role.user });
    const app = await createTestApplication(job.id, applicant.id);
    applications.push(app);
  }
  return { recruiter, company, job, applications };
}

describe("Bulk Status Transition (Phase 4.5)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("bulk reject with reason succeeds", async () => {
    const { recruiter, applications } = await seedJobWithApplicants(3);
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/bulk/status/route");
    const req = new NextRequest("http://localhost/api/recruiter/applications/bulk/status", {
      method: "POST",
      body: JSON.stringify({
        applicationIds: applications.map((a) => a.id),
        status: "rejected",
        rejectionReason: "Not enough experience",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const allApps = await prisma.application.findMany({ where: { jobId: applications[0].jobId } });
    expect(allApps.every((a) => a.status === "rejected")).toBe(true);
    expect(allApps.every((a) => a.rejectionReason === "Not enough experience")).toBe(true);
  });

  it("bulk to reviewing without reason succeeds", async () => {
    const { recruiter, applications } = await seedJobWithApplicants(3);
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/bulk/status/route");
    const req = new NextRequest("http://localhost/api/recruiter/applications/bulk/status", {
      method: "POST",
      body: JSON.stringify({
        applicationIds: applications.map((a) => a.id),
        status: "reviewing",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const allApps = await prisma.application.findMany({ where: { jobId: applications[0].jobId } });
    expect(allApps.every((a) => a.status === "reviewing")).toBe(true);
  });

  it("bulk reject without reason fails validation", async () => {
    const { recruiter, applications } = await seedJobWithApplicants(3);
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/bulk/status/route");
    const req = new NextRequest("http://localhost/api/recruiter/applications/bulk/status", {
      method: "POST",
      body: JSON.stringify({
        applicationIds: applications.map((a) => a.id),
        status: "rejected",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("bulk atomic on failure — zero rows changed when one application belongs to other company", async () => {
    const { recruiter: recruiterA, applications: appsA } = await seedJobWithApplicants(2);
    const recruiterB = await createTestUser({ role: Role.recruiter });
    const companyB = await createTestCompany(recruiterB.id);
    const jobB = await createTestJob(recruiterB.id, companyB.id);
    const intruder = await createTestUser({ role: Role.user });
    const appB = await createTestApplication(jobB.id, intruder.id);

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { POST } = await import("@/app/api/recruiter/applications/bulk/status/route");
    const req = new NextRequest("http://localhost/api/recruiter/applications/bulk/status", {
      method: "POST",
      body: JSON.stringify({
        applicationIds: [...appsA.map((a) => a.id), appB.id],
        status: "reviewing",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);

    const allA = await prisma.application.findMany({ where: { id: { in: appsA.map((a) => a.id) } } });
    expect(allA.every((a) => a.status === "applied")).toBe(true);
  });

  it("audit per application records each transition", async () => {
    const { recruiter, applications } = await seedJobWithApplicants(3);
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/bulk/status/route");
    const req = new NextRequest("http://localhost/api/recruiter/applications/bulk/status", {
      method: "POST",
      body: JSON.stringify({
        applicationIds: applications.map((a) => a.id),
        status: "reviewing",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const changes = await prisma.applicationStatusChange.findMany({
      where: { toStatus: "reviewing" },
    });
    expect(changes).toHaveLength(3);
    changes.forEach((c) => {
      expect(c.fromStatus).toBe("applied");
      expect(c.toStatus).toBe("reviewing");
    });
  });
});
