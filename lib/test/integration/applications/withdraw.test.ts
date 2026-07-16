import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser, createTestCompany, createTestJob, createTestApplication } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

async function seedUserWithApplication() {
  const user = await createTestUser({ role: Role.user });
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  const application = await createTestApplication(job.id, user.id);
  return { user, application };
}

describe("Withdraw Application (Phase 4.13)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("withdraw from applied succeeds", async () => {
    const { user, application } = await seedUserWithApplication();
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { userService } = await import("@/lib/services/user-service");
    await userService.withdrawApplication(application.id, user.id);

    const deleted = await prisma.application.findUnique({ where: { id: application.id } });
    expect(deleted).toBeNull();
  });

  it("withdraw from reviewing succeeds", async () => {
    const { user, application } = await seedUserWithApplication();
    await prisma.application.update({ where: { id: application.id }, data: { status: "reviewing" } });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { userService } = await import("@/lib/services/user-service");
    await userService.withdrawApplication(application.id, user.id);

    const deleted = await prisma.application.findUnique({ where: { id: application.id } });
    expect(deleted).toBeNull();
  });

  it("withdraw from hired rejected", async () => {
    const { user, application } = await seedUserWithApplication();
    await prisma.application.update({ where: { id: application.id }, data: { status: "hired" } });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { DELETE } = await import("@/app/api/user/applications/[id]/route");
    const req = new NextRequest(`http://localhost/api/user/applications/${application.id}`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: application.id }) });
    expect(res.status).toBe(400);
  });

  it("cross-user withdraw blocked", async () => {
    const { application } = await seedUserWithApplication();
    const otherUser = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: otherUser.id }));

    const { DELETE } = await import("@/app/api/user/applications/[id]/route");
    const req = new NextRequest(`http://localhost/api/user/applications/${application.id}`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: application.id }) });
    expect(res.status).toBe(404);
  });

  it("A4: withdraw records an ApplicationStatusChange audit row (fromStatus -> withdrawn)", async () => {
    const { user, application } = await seedUserWithApplication();
    await prisma.application.update({ where: { id: application.id }, data: { status: "reviewing" } });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { userService } = await import("@/lib/services/user-service");
    await userService.withdrawApplication(application.id, user.id);

    const deleted = await prisma.application.findUnique({ where: { id: application.id } });
    expect(deleted).toBeNull();

    // A4: the audit row persists after the (hard) delete. The applicationId
    // FK is set null on delete (onDelete: SetNull), so we locate the withdraw
    // audit by its actor + toStatus instead.
    const withdrawChanges = await prisma.applicationStatusChange.findMany({
      where: { changedById: user.id, toStatus: "withdrawn" },
    });
    expect(withdrawChanges).toHaveLength(1);
    expect(withdrawChanges[0].fromStatus).toBe("reviewing");
  });
});
