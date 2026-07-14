import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("Notifications (Phase 4.16)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("list returns own notifications", async () => {
    const user = await createTestUser({ role: Role.user });
    await prisma.notification.create({
      data: { userId: user.id, type: "application_status", data: { note: "test" } },
    });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications?take=50");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.notifications).toHaveLength(1);
    expect(body.data.notifications[0].data.note).toBe("test");
  });

  it("unread count included in response", async () => {
    const user = await createTestUser({ role: Role.user });
    await prisma.notification.createMany({
      data: [
        { userId: user.id, type: "application_status", data: { note: "unread1" }, read: false },
        { userId: user.id, type: "application_status", data: { note: "unread2" }, read: false },
        { userId: user.id, type: "application_status", data: { note: "read1" }, read: true },
      ],
    });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications?take=50");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.unreadCount).toBe(2);
  });

  it("cross-user read — user A cannot see user B's notifications", async () => {
    const userA = await createTestUser({ role: Role.user });
    const userB = await createTestUser({ role: Role.user });
    await prisma.notification.create({
      data: { userId: userB.id, type: "application_status", data: { note: "B-secret" } },
    });
    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));

    const { GET } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications?take=50");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    const bItems = body.data.notifications.filter(
      (n: { data: Record<string, unknown> }) => n.data?.note === "B-secret",
    );
    expect(bItems).toHaveLength(0);
  });

  it("mark notifications as read", async () => {
    const user = await createTestUser({ role: Role.user });
    const n1 = await prisma.notification.create({
      data: { userId: user.id, type: "application_status", data: { note: "a" }, read: false },
    });
    const n2 = await prisma.notification.create({
      data: { userId: user.id, type: "application_status", data: { note: "b" }, read: false },
    });
    const n3 = await prisma.notification.create({
      data: { userId: user.id, type: "application_status", data: { note: "c" }, read: false },
    });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { PATCH } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ ids: [n1.id, n2.id] }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const updatedN1 = await prisma.notification.findUnique({ where: { id: n1.id } });
    const updatedN2 = await prisma.notification.findUnique({ where: { id: n2.id } });
    const updatedN3 = await prisma.notification.findUnique({ where: { id: n3.id } });
    expect(updatedN1?.read).toBe(true);
    expect(updatedN2?.read).toBe(true);
    expect(updatedN3?.read).toBe(false);
  });

  it("mark-as-read only affects own notifications", async () => {
    const userA = await createTestUser({ role: Role.user });
    const userB = await createTestUser({ role: Role.user });
    const nB = await prisma.notification.create({
      data: { userId: userB.id, type: "application_status", data: { note: "b" }, read: false },
    });
    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));

    const { PATCH } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ ids: [nB.id] }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const updated = await prisma.notification.findUnique({ where: { id: nB.id } });
    expect(updated?.read).toBe(false);
  });
});
