import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser, createTestCompany, createTestJob, createTestApplication } from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { seedRecruiterCompany, seedJobWithApplicant } from "@/lib/test/integration/helpers";

describe("CSV Export (Phase 4.19)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("export returns CSV for job with applicants", async () => {
    const { recruiter, job } = await seedJobWithApplicant();

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { GET } = await import("@/app/api/recruiter/jobs/[id]/applicants/export/route");
    const req = new NextRequest(`http://localhost/api/recruiter/jobs/${job.id}/applicants/export`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/^text\/csv/);
  });

  it("export respects status filter", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    const applicant1 = await createTestUser({ role: Role.user });
    const applicant2 = await createTestUser({ role: Role.user });
    await createTestApplication(job.id, applicant1.id, { status: "reviewing" });
    await createTestApplication(job.id, applicant2.id, { status: "applied" });

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { GET } = await import("@/app/api/recruiter/jobs/[id]/applicants/export/route");
    const req = new NextRequest(
      `http://localhost/api/recruiter/jobs/${job.id}/applicants/export?status=reviewing`,
    );
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
  });

  it("cross-company export blocked", async () => {
    const { recruiter: recruiterA } = await seedJobWithApplicant();
    const [, , jobB] = await seedRecruiterCompany();

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { GET } = await import("@/app/api/recruiter/jobs/[id]/applicants/export/route");
    const req = new NextRequest(`http://localhost/api/recruiter/jobs/${jobB.id}/applicants/export`);
    const res = await GET(req, { params: Promise.resolve({ id: jobB.id }) });
    expect(res.status).toBe(404);
  });
});
