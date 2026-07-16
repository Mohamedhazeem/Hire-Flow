import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { seedJobWithApplicant } from "@/lib/test/integration/helpers";

async function patchStatus(applicationId: string, recruiterId: string, updatedAt?: string) {
  mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterId }));
  const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
  const req = new NextRequest(`http://localhost/api/recruiter/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "reviewing", updatedAt }),
  });
  return PATCH(req, { params: Promise.resolve({ applicationId }) });
}

describe("Application race conditions (C1 / C4)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("C1: concurrent same-status transition — only one wins, loser gets 409", async () => {
    const { recruiter, application } = await seedJobWithApplicant();
    const before = await prisma.application.findUnique({ where: { id: application.id } });

    const [r1, r2] = await Promise.all([
      patchStatus(application.id, recruiter.id, before?.updatedAt.toISOString()),
      patchStatus(application.id, recruiter.id, before?.updatedAt.toISOString()),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([200, 409]);

    const final = await prisma.application.findUnique({ where: { id: application.id } });
    expect(final?.status).toBe("reviewing");

    const changes = await prisma.applicationStatusChange.findMany({ where: { applicationId: application.id } });
    expect(changes).toHaveLength(1);
  });

  it("C4: withdraw (DELETE) racing with status PATCH ends in a consistent state", async () => {
    const { recruiter, applicant, application } = await seedJobWithApplicant();

    const patchPromise = (async () => {
      mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));
      const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
      const req = new NextRequest(`http://localhost/api/recruiter/applications/${application.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "reviewing" }),
      });
      return PATCH(req, { params: Promise.resolve({ applicationId: application.id }) });
    })();

    const deletePromise = (async () => {
      mockGetSession.mockResolvedValue(mockSession("user", { id: applicant.id }));
      const { DELETE } = await import("@/app/api/user/applications/[id]/route");
      const req = new NextRequest(`http://localhost/api/user/applications/${application.id}`, { method: "DELETE" });
      return DELETE(req, { params: Promise.resolve({ id: application.id }) });
    })();

    await Promise.allSettled([patchPromise, deletePromise]);

    const final = await prisma.application.findUnique({ where: { id: application.id } });
    // withdrawApplication HARD-deletes the row. So either:
    //  - application is gone (withdraw won), or
    //  - application remains with status advanced to "reviewing" (patch won).
    // It must never be both, and never neither.
    const withdrawn = final === null;
    const advanced = final?.status === "reviewing";
    expect(withdrawn || advanced).toBe(true);

    const changes = await prisma.applicationStatusChange.findMany({ where: { applicationId: application.id } });
    // If the row was deleted by withdraw, no new status change should exist.
    if (withdrawn) {
      const nonAppliedChanges = changes.filter((c) => c.toStatus !== "applied");
      expect(nonAppliedChanges).toHaveLength(0);
    }
  });
});
