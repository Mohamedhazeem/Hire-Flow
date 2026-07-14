import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser, createTestCompany, createTestJob, createTestApplication } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { seedJobWithApplicant } from "@/lib/test/integration/helpers";

describe("Application Status Transition (Phase 4.4)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("applied to reviewing succeeds", async () => {
    const { recruiter, company, job, applicant, application } = await seedJobWithApplicant();
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "reviewing" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.application.findUnique({ where: { id: application.id } });
    expect(updated?.status).toBe("reviewing");

    const changes = await prisma.applicationStatusChange.findMany({
      where: { applicationId: application.id },
      orderBy: { createdAt: "asc" },
    });
    expect(changes).toHaveLength(1);
    expect(changes[0].fromStatus).toBe("applied");
    expect(changes[0].toStatus).toBe("reviewing");
  });

  it("reviewing to shortlisted succeeds", async () => {
    const { recruiter, company, job, applicant, application } = await seedJobWithApplicant();
    await prisma.application.update({ where: { id: application.id }, data: { status: "reviewing" } });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "shortlisted" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.application.findUnique({ where: { id: application.id } });
    expect(updated?.status).toBe("shortlisted");
  });

  it("hired to applied rejected (invalid transition)", async () => {
    const { recruiter, company, job, applicant, application } = await seedJobWithApplicant();
    await prisma.application.update({ where: { id: application.id }, data: { status: "hired" } });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "applied" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(400);
  });

  it("rejected to reviewing rejected (invalid transition)", async () => {
    const { recruiter, company, job, applicant, application } = await seedJobWithApplicant();
    await prisma.application.update({ where: { id: application.id }, data: { status: "rejected" } });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "reviewing" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(400);
  });

  it("reject with reason stores rejectionReason", async () => {
    const { recruiter, company, job, applicant, application } = await seedJobWithApplicant();
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected", rejectionReason: "Not a fit" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.application.findUnique({ where: { id: application.id } });
    expect(updated?.status).toBe("rejected");
    expect(updated?.rejectionReason).toBe("Not a fit");
  });

  it("interview with details stores data", async () => {
    const { recruiter, company, job, applicant, application } = await seedJobWithApplicant();
    await prisma.application.update({ where: { id: application.id }, data: { status: "shortlisted" } });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "interview_scheduled",
        interviewDate: new Date("2026-08-01T10:00:00Z").toISOString(),
        meetingLink: "https://meet.example.com/test",
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.application.findUnique({ where: { id: application.id } });
    expect(updated?.status).toBe("interview_scheduled");
    expect(updated?.interviewDate).not.toBeNull();
    expect(updated?.meetingLink).toBe("https://meet.example.com/test");
  });

  it("offer with details stores data", async () => {
    const { recruiter, company, job, applicant, application } = await seedJobWithApplicant();
    await prisma.application.update({ where: { id: application.id }, data: { status: "interview_scheduled" } });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "offered", offerDetails: "Full-time, $100k" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.application.findUnique({ where: { id: application.id } });
    expect(updated?.status).toBe("offered");
    expect(updated?.offerDetails).toBe("Full-time, $100k");
  });

  it("cross-company access blocked", async () => {
    const { recruiter: recruiterA } = await seedJobWithApplicant();
    const { application: appB } = await seedJobWithApplicant();
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${appB.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "reviewing" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: appB.id }) });
    expect(res.status).toBe(404);
  });
});
