import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  mockSession,
  resetDb,
  createTestUser,
  createTestCompany,
  createTestJob,
  createTestResume,
} from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("Apply to Job (Phase 4.3)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("successful apply creates application and audit trail", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    const user = await createTestUser({ role: Role.user });
    const resume = await createTestResume(user.id, { isPrimary: true });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId: resume.id, coverLetter: "I want this job" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(201);

    const changes = await prisma.applicationStatusChange.findMany({
      orderBy: { createdAt: "asc" },
    });
    expect(changes).toHaveLength(1);
    expect(changes[0].fromStatus).toBe("applied");
    expect(changes[0].toStatus).toBe("applied");
    expect(changes[0].changedById).toBe(user.id);

    const application = await prisma.application.findFirst({
      where: { userId: user.id, jobId: job.id },
    });
    expect(application).not.toBeNull();
    expect(application!.status).toBe("applied");
    expect(application!.resumeId).toBe(resume.id);
  });

  it("duplicate apply blocked", async () => {
    const { user, job } = await seedApplyData();
    // First application is created by sendApply with a resume
    const resume = await createTestResume(user.id, { isPrimary: true });
    await sendApply(user, job, resume.id);
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId: resume.id }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    // Duplicate check in applicationService.applyToJob → ConflictError → 409
    expect(res.status).toBe(409);
  });

  it("missing body fields rejected", async () => {
    const { user, job } = await seedApplyData();
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    // Missing resumeId fails Zod validation → ValidationError → 400
    expect(res.status).toBe(400);
  });

  it("non-existent resumeId rejected", async () => {
    const { user, job } = await seedApplyData();
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId: "00000000-0000-0000-0000-000000000000" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    // Resume not found returns NotFoundError → 404
    expect(res.status).toBe(404);
  });

  it("archived job rejected", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id, { status: "archived" });
    const user = await createTestUser({ role: Role.user });
    const resume = await createTestResume(user.id, { isPrimary: true });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId: resume.id }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(400);
  });

  it("inactive job rejected", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id, { isActive: false });
    const user = await createTestUser({ role: Role.user });
    const resume = await createTestResume(user.id, { isPrimary: true });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId: resume.id }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(400);
  });

  it("extra fields in body stripped", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    const user = await createTestUser({ role: Role.user });
    const resume = await createTestResume(user.id, { isPrimary: true });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId: resume.id, status: "hired", maliciousField: "injected" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(201);

    const application = await prisma.application.findFirst({
      where: { userId: user.id, jobId: job.id },
    });
    expect(application?.status).toBe("applied");
  });

  it("resume snapshot frozen after soft-deletion", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    const user = await createTestUser({ role: Role.user });
    const resume = await createTestResume(user.id, {
      isPrimary: true,
      fileUrl: `/uploads/resume-${user.id}.pdf`,
    });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/jobs/[id]/apply/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId: resume.id }),
    });
    const postRes = await POST(req, { params: Promise.resolve({ id: job.id }) });
    expect(postRes.status).toBe(201);

    const application = await prisma.application.findFirst({
      where: { userId: user.id, jobId: job.id },
    });
    expect(application?.resumeSnapshotUrl).not.toBeNull();

    await prisma.resume.update({ where: { id: resume.id }, data: { deletedAt: new Date() } });

    const detail = await prisma.application.findFirst({
      where: { userId: user.id, jobId: job.id },
    });
    expect(detail?.resumeSnapshotUrl).not.toBeNull();
  });
});

async function seedApplyData(): Promise<{
  user: ReturnType<typeof createTestUser> extends Promise<infer T> ? T : never;
  job: ReturnType<typeof createTestJob> extends Promise<infer T> ? T : never;
}> {
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  const user = await createTestUser({ role: Role.user });
  return { user, job };
}

async function sendApply(user: { id: string }, job: { id: string }, resumeId?: string) {
  const resume = resumeId ? undefined : await createTestResume(user.id, { isPrimary: true });
  mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));
  const { POST } = await import("@/app/api/jobs/[id]/apply/route");
  const req = new NextRequest(`http://localhost/api/jobs/${job.id}/apply`, {
    method: "POST",
    body: JSON.stringify({ resumeId: resumeId ?? resume!.id }),
  });
  const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
  return res;
}
