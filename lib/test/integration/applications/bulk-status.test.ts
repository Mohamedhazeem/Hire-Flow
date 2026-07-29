import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  mockSession,
  resetDb,
  createTestUser,
  createTestCompany,
  createTestJob,
  createTestApplication,
} from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { mockResend } from "@/lib/test/mocks";

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

  it("pre-filtered mixed-status — only eligible applicants are sent and updated", async () => {
    const { recruiter, applications } = await seedJobWithApplicants(3);
    // Move one applicant to reviewing so it can't go back to reviewing
    await prisma.application.update({
      where: { id: applications[0].id },
      data: { status: "reviewing" },
    });

    // Only send the 2 applied applicants (the reviewing one is filtered out by frontend)
    const eligibleIds = applications.slice(1).map((a) => a.id);
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/bulk/status/route");
    const req = new NextRequest("http://localhost/api/recruiter/applications/bulk/status", {
      method: "POST",
      body: JSON.stringify({
        applicationIds: eligibleIds,
        status: "reviewing",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const updated = await prisma.application.findMany({
      where: { id: { in: eligibleIds } },
    });
    expect(updated.every((a) => a.status === "reviewing")).toBe(true);

    // The already-reviewing applicant stays unchanged
    const unchanged = await prisma.application.findUnique({
      where: { id: applications[0].id },
    });
    expect(unchanged?.status).toBe("reviewing");
  });

  it("bulk status creates notifications for each applicant", async () => {
    const { recruiter, applications } = await seedJobWithApplicants(2);
    const apps = await prisma.application.findMany({
      where: { id: { in: applications.map((a) => a.id) } },
      select: { id: true, userId: true },
    });
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

    // Notifications are fire-and-forget, so poll until they appear
    for (const app of apps) {
      await vi.waitFor(
        async () => {
          const notification = await prisma.notification.findFirst({
            where: { userId: app.userId, type: "application_status" },
          });
          expect(notification).not.toBeNull();
          const notifData = notification?.data as Record<string, unknown> | undefined;
          expect(notifData?.newStatus).toBe("reviewing");
          expect(notifData?.applicationId).toBe(app.id);
        },
        { timeout: 5000, interval: 200 },
      );
    }
  });

  it("bulk status with email=true calls sendEmail for each applicant", async () => {
    const emailSpy = mockResend();
    const { recruiter, applications } = await seedJobWithApplicants(2);
    const apps = await prisma.application.findMany({
      where: { id: { in: applications.map((a) => a.id) } },
      select: { id: true, userId: true, user: { select: { email: true, name: true } } },
    });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/bulk/status/route");
    const req = new NextRequest("http://localhost/api/recruiter/applications/bulk/status", {
      method: "POST",
      body: JSON.stringify({
        applicationIds: applications.map((a) => a.id),
        status: "reviewing",
        email: true,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    await vi.waitFor(
      () => {
        expect(emailSpy).toHaveBeenCalledTimes(2);
        for (const app of apps) {
          expect(emailSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              to: app.user.email,
              type: "application_status",
              subject: expect.stringContaining("Application Status"),
            }),
          );
        }
      },
      { timeout: 5000, interval: 200 },
    );
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
