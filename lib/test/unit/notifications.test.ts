import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { createNotification, triggerForCompany } from "@/lib/notifications";
import { sendEmail } from "@/app/features/auth/libs/email";
import { createTestUser, createTestCompany } from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  mockResendSend: vi.fn().mockResolvedValue({ data: { id: "e1" }, error: null }),
  mockPusherTrigger: vi.fn().mockResolvedValue({}),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({ emails: { send: mocks.mockResendSend } })),
}));
vi.mock("@/lib/pusher/pusher", () => ({
  pusher: { trigger: mocks.mockPusherTrigger },
}));

describe("Notifications & Delivery (N2 / N4 / N5 / N6 / M1 / M2 / M3)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.mockPusherTrigger.mockResolvedValue({});
    await prisma.$executeRaw`TRUNCATE TABLE "notification", "user", "company", "company_team_member" RESTART IDENTITY CASCADE;`;
  });

  describe("N2: invalid userId in createNotification", () => {
    it("throws when the recipient user does not exist", async () => {
      await expect(createNotification("does-not-exist", "application_status", { a: 1 })).rejects.toThrow(
        /does not exist/i,
      );
    });

    it("creates a notification for a valid user and triggers Pusher", async () => {
      const user = await createTestUser({ role: Role.user });
      const notification = await createNotification(user.id, "application_status", { a: 1 });
      expect(notification.userId).toBe(user.id);
      expect(mocks.mockPusherTrigger).toHaveBeenCalledWith(
        `private-user-${user.id}`,
        "new-notification",
        expect.objectContaining({ notification: expect.objectContaining({ id: notification.id }) }),
      );
    });
  });

  describe("N4/N5/N6: triggerForCompany", () => {
    it("N4: excludes the action performer (excludeUserId)", async () => {
      const owner = await createTestUser({ role: Role.recruiter });
      const company = await createTestCompany(owner.id);
      const performer = await createTestUser({ role: Role.recruiter });
      const other = await createTestUser({ role: Role.recruiter });
      // company already has `owner` as a team member (createTestCompany).
      await prisma.companyTeamMember.createMany({
        data: [
          { companyId: company.id, userId: performer.id },
          { companyId: company.id, userId: other.id },
        ],
      });

      const created = await triggerForCompany(company.id, "application_status", { x: 1 }, { excludeUserId: performer.id });
      // owner + other remain; performer excluded.
      const createdUserIds = created.map((n) => n.userId).sort();
      expect(createdUserIds).toEqual([owner.id, other.id].sort());
      expect(createdUserIds).not.toContain(performer.id);
    });

    it("N5: empty company team returns no notifications (no error)", async () => {
      // Build a company WITHOUT the auto team-member that createTestCompany adds.
      const company = await prisma.company.create({
        data: {
          id: "empty-team-co",
          recruiterId: (await createTestUser({ role: Role.recruiter })).id,
          name: "Empty Team Co",
        },
      });
      const created = await triggerForCompany(company.id, "application_status", { x: 1 });
      expect(created).toEqual([]);
    });

    it("N6: fire-and-forget — does not throw when Pusher trigger fails", async () => {
      const owner = await createTestUser({ role: Role.recruiter });
      const company = await createTestCompany(owner.id);
      const member = await createTestUser({ role: Role.recruiter });
      await prisma.companyTeamMember.create({
        data: { companyId: company.id, userId: member.id },
      });
      mocks.mockPusherTrigger.mockRejectedValueOnce(new Error("pusher down"));

      // The DB write still succeeds and the function resolves (void trigger).
      const created = await triggerForCompany(company.id, "application_status", { x: 1 });
      expect(created.length).toBeGreaterThanOrEqual(1);
      expect(await prisma.notification.count()).toBe(created.length);
    });
  });

  describe("M1/M2/M3: email delivery", () => {
    it("M1: skips email send for a banned user", async () => {
      const user = await createTestUser({ role: Role.user });
      await prisma.user.update({ where: { id: user.id }, data: { banned: true } });

      await sendEmail({ to: user.email, subject: "Verify", url: "https://x", type: "verification", userId: user.id });

      expect(mocks.mockResendSend).not.toHaveBeenCalled();
    });

    it("M1 (positive): email is sent for a non-banned user", async () => {
      const user = await createTestUser({ role: Role.user });

      await sendEmail({ to: user.email, subject: "Verify", url: "https://x", type: "verification", userId: user.id });

      expect(mocks.mockResendSend).toHaveBeenCalledTimes(1);
    });

    it("M2: notification creation is fire-and-forget (void), does not block the caller", async () => {
      const user = await createTestUser({ role: Role.user });
      mocks.mockPusherTrigger.mockRejectedValueOnce(new Error("pusher down"));
      // Should resolve without throwing despite the Pusher failure.
      await expect(createNotification(user.id, "application_status", { a: 1 })).resolves.toBeDefined();
    });

    it("M3: missing Pusher key does not throw (no-op fallback)", async () => {
      const user = await createTestUser({ role: Role.user });
      // pusher.trigger is a vi.fn() (no-op). Notification must still persist.
      await createNotification(user.id, "application_status", { a: 1 });
      expect(await prisma.notification.count()).toBe(1);
    });
  });
});
