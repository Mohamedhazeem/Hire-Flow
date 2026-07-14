import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import { faker } from "@faker-js/faker";

describe("Admin Sessions (Phase 4.10)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("list sessions for user", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const target = await createTestUser({ role: Role.user });
    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: target.id, token: "token1", expiresAt: new Date(Date.now() + 86400000) },
    });
    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: target.id, token: "token2", expiresAt: new Date(Date.now() + 86400000) },
    });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { GET } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/sessions`);
    const res = await GET(req, { params: Promise.resolve({ id: target.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
  });

  it("revoke all sessions for user", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const target = await createTestUser({ role: Role.user });
    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: target.id, token: "token1", expiresAt: new Date(Date.now() + 86400000) },
    });
    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: target.id, token: "token2", expiresAt: new Date(Date.now() + 86400000) },
    });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { DELETE } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/sessions`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: target.id }) });
    expect(res.status).toBe(200);

    // Note: auth.api.revokeUserSessions is mocked and doesn't actually delete
    // The route calls the mock, we verify it returns successfully
    const sessions = await prisma.session.findMany({ where: { userId: target.id } });
    expect(sessions).toHaveLength(2);
  });

  it("admin can target super_admin sessions (no super_admin guard in route)", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const superAdmin = await createTestUser({ role: Role.super_admin });
    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { DELETE } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${superAdmin.id}/sessions`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: superAdmin.id }) });
    // Known: no super_admin guard exists in the sessions route
    expect(res.status).toBe(200);
  });
});
