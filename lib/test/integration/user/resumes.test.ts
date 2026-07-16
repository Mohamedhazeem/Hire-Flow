import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser, createTestResume } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("User Resumes CRUD (Phase 4.7)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("list own resumes", async () => {
    const user = await createTestUser({ role: Role.user });
    await createTestResume(user.id, { label: "Resume 1" });
    await createTestResume(user.id, { label: "Resume 2" });
    await createTestResume(user.id, { label: "Resume 3" });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/user/resumes/route");
    const req = new NextRequest("http://localhost/api/user/resumes");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(3);
  });

  it("set-primary leaves exactly one primary resume", async () => {
    const user = await createTestUser({ role: Role.user });
    const r1 = await createTestResume(user.id, { isPrimary: false });
    const r2 = await createTestResume(user.id, { isPrimary: false });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { PATCH } = await import("@/app/api/user/resumes/[id]/route");
    const req = new NextRequest(`http://localhost/api/user/resumes/${r1.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "set-primary" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: r1.id }) });
    expect(res.status).toBe(200);

    const primaries = await prisma.resume.findMany({ where: { userId: user.id, isPrimary: true } });
    expect(primaries).toHaveLength(1);
    expect(primaries[0].id).toBe(r1.id);
  });

  it("soft-delete sets deletedAt", async () => {
    const user = await createTestUser({ role: Role.user });
    const resume = await createTestResume(user.id);
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { DELETE } = await import("@/app/api/user/resumes/[id]/route");
    const req = new NextRequest(`http://localhost/api/user/resumes/${resume.id}`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: resume.id }) });
    expect(res.status).toBe(204);

    const deleted = await prisma.resume.findUnique({ where: { id: resume.id } });
    expect(deleted?.deletedAt).not.toBeNull();
  });

  it("cross-user resume access blocked", async () => {
    const userA = await createTestUser({ role: Role.user });
    const userB = await createTestUser({ role: Role.user });
    const resumeB = await createTestResume(userB.id);
    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));

    const { PATCH } = await import("@/app/api/user/resumes/[id]/route");
    const req = new NextRequest(`http://localhost/api/user/resumes/${resumeB.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "set-primary" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: resumeB.id }) });
    expect(res.status).toBe(403);
  });

  it("soft-deleted resume excluded from list", async () => {
    const user = await createTestUser({ role: Role.user });
    await createTestResume(user.id, { label: "Active" });
    const r2 = await createTestResume(user.id, { label: "Deleted" });
    await prisma.resume.update({ where: { id: r2.id }, data: { deletedAt: new Date() } });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/user/resumes/route");
    const req = new NextRequest("http://localhost/api/user/resumes");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].label).toBe("Active");
  });

  it("C2: concurrent set-primary across two resumes leaves exactly one primary", async () => {
    const user = await createTestUser({ role: Role.user });
    const r1 = await createTestResume(user.id, { isPrimary: true });
    const r2 = await createTestResume(user.id, { isPrimary: false });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const patchPrimary = async (id: string) => {
      mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));
      const { PATCH } = await import("@/app/api/user/resumes/[id]/route");
      const req = new NextRequest(`http://localhost/api/user/resumes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "set-primary" }),
      });
      return PATCH(req, { params: Promise.resolve({ id }) });
    };

    const [res1, res2] = await Promise.all([patchPrimary(r2.id), patchPrimary(r1.id)]);
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const primaries = await prisma.resume.count({
      where: { userId: user.id, isPrimary: true, deletedAt: null },
    });
    expect(primaries).toBe(1);
  });
});
