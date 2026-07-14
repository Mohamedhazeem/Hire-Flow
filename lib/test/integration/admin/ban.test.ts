import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { faker } from "@faker-js/faker";

describe("Admin Ban (Phase 4.9)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("ban sets banned flag and revokes sessions", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const target = await createTestUser({ role: Role.user });

    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: target.id, token: "test-token", expiresAt: new Date(Date.now() + 86400000) },
    });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { POST } = await import("@/app/api/admin/users/[id]/ban/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/ban`, {
      method: "POST",
      body: JSON.stringify({ banReason: "Violated terms", banExpiresIn: 30 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: target.id }) });
    expect(res.status).toBe(200);

    const banned = await prisma.user.findUnique({ where: { id: target.id } });
    expect(banned?.banned).toBe(true);
    expect(banned?.banReason).toBe("Violated terms");

    const sessions = await prisma.session.findMany({ where: { userId: target.id } });
    expect(sessions).toHaveLength(0);
  });

  it("missing banReason accepted (banReason is optional)", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const target = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { POST } = await import("@/app/api/admin/users/[id]/ban/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/ban`, {
      method: "POST",
      body: JSON.stringify({ banExpiresIn: 30 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: target.id }) });
    expect(res.status).toBe(200);

    const banned = await prisma.user.findUnique({ where: { id: target.id } });
    expect(banned?.banned).toBe(true);
  });

  it("invalid banExpiresIn rejected", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const target = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { POST } = await import("@/app/api/admin/users/[id]/ban/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/ban`, {
      method: "POST",
      body: JSON.stringify({ banReason: "Spam", banExpiresIn: "30d" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: target.id }) });
    expect(res.status).toBe(400);
  });

  it("super_admin can ban user", async () => {
    const superAdmin = await createTestUser({ role: Role.super_admin });
    const target = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("super_admin", { id: superAdmin.id }));

    const { POST } = await import("@/app/api/admin/users/[id]/ban/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/ban`, {
      method: "POST",
      body: JSON.stringify({ banReason: "Spam", banExpiresIn: 7 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: target.id }) });
    expect(res.status).toBe(200);

    const banned = await prisma.user.findUnique({ where: { id: target.id } });
    expect(banned?.banned).toBe(true);
  });
});
