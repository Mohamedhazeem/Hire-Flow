import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { seedJobWithApplicant } from "@/lib/test/integration/helpers";

describe("Revert Status (Phase 4.6)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("revert to prior status succeeds with audit", async () => {
    const { recruiter, application } = await seedJobWithApplicant();
    await prisma.application.update({ where: { id: application.id }, data: { status: "reviewing" } });
    await prisma.applicationStatusChange.create({
      data: {
        applicationId: application.id,
        fromStatus: "applied",
        toStatus: "reviewing",
        changedById: recruiter.id,
      },
    });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/[applicationId]/revert/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/revert`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.application.findUnique({ where: { id: application.id } });
    expect(updated?.status).toBe("applied");

    const changes = await prisma.applicationStatusChange.findMany({
      where: { applicationId: application.id },
      orderBy: { createdAt: "asc" },
    });
    const revertChange = changes[changes.length - 1];
    expect(revertChange.fromStatus).toBe("reviewing");
    expect(revertChange.toStatus).toBe("applied");
  });

  it("revert when no history returns error", async () => {
    const { recruiter, application } = await seedJobWithApplicant();
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { POST } = await import("@/app/api/recruiter/applications/[applicationId]/revert/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/revert`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ applicationId: application.id }) });
    expect(res.status).toBe(400);
  });

  it("cross-company revert blocked", async () => {
    const { recruiter: recruiterA } = await seedJobWithApplicant();
    const { application: appB } = await seedJobWithApplicant();
    await prisma.application.update({ where: { id: appB.id }, data: { status: "reviewing" } });
    await prisma.applicationStatusChange.create({
      data: {
        applicationId: appB.id,
        fromStatus: "applied",
        toStatus: "reviewing",
        changedById: (await seedJobWithApplicant()).recruiter.id,
      },
    });
    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { POST } = await import("@/app/api/recruiter/applications/[applicationId]/revert/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${appB.id}/revert`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ applicationId: appB.id }) });
    expect(res.status).toBe(400);
  });
});
