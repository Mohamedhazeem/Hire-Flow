import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession, mockRevokeUserSessions } from "@/lib/test/shared-auth-mock";
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
    expect(body.data[0]).toHaveProperty("token");
  });

  it("revoke all sessions for user target", async () => {
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

    // Verify the mock was called with the correct target userId
    expect(mockRevokeUserSessions).toHaveBeenCalledTimes(1);
    expect(mockRevokeUserSessions).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: target.id } }),
    );
  });

  it("admin can revoke sessions for recruiter target", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const recruiter = await createTestUser({ role: Role.recruiter });
    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: recruiter.id, token: "rtoken1", expiresAt: new Date(Date.now() + 86400000) },
    });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { DELETE } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${recruiter.id}/sessions`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: recruiter.id }) });
    expect(res.status).toBe(200);
    expect(mockRevokeUserSessions).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: recruiter.id } }),
    );
  });

  it("admin can revoke a super_admin's sessions", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const superAdmin = await createTestUser({ role: Role.super_admin });
    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: superAdmin.id, token: "stoken1", expiresAt: new Date(Date.now() + 86400000) },
    });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { DELETE } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${superAdmin.id}/sessions`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: superAdmin.id }) });
    expect(res.status).toBe(200);
  });

  it("super_admin can revoke own sessions (role permissions fixed)", async () => {
    const superAdmin = await createTestUser({ role: Role.super_admin });
    await prisma.session.create({
      data: { id: faker.string.uuid(), userId: superAdmin.id, token: "sadmintoken", expiresAt: new Date(Date.now() + 86400000) },
    });

    mockGetSession.mockResolvedValue(mockSession("super_admin", { id: superAdmin.id }));

    const { DELETE } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${superAdmin.id}/sessions`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: superAdmin.id }) });
    expect(res.status).toBe(200);
  });

  it("user role cannot revoke sessions (auth guard)", async () => {
    const user = await createTestUser({ role: Role.user });
    const target = await createTestUser({ role: Role.user });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { DELETE } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/sessions`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: target.id }) });
    // requireRole(["admin", "super_admin"]) throws ForbiddenError → handler returns 403
    expect(res.status).toBe(403);
    expect(mockRevokeUserSessions).not.toHaveBeenCalled();
  });

  it("recruiter role cannot revoke sessions (auth guard)", async () => {
    const recruiterUser = await createTestUser({ role: Role.recruiter });
    const target = await createTestUser({ role: Role.user });

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterUser.id }));

    const { DELETE } = await import("@/app/api/admin/users/[id]/sessions/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${target.id}/sessions`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: target.id }) });
    // requireRole(["admin", "super_admin"]) throws ForbiddenError → handler returns 403
    expect(res.status).toBe(403);
    expect(mockRevokeUserSessions).not.toHaveBeenCalled();
  });
});
