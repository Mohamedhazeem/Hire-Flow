import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser, createTestCompany, createTestJob } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("User Bookmarks (Phase 4.12)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("toggle create — first POST creates bookmark", async () => {
    const user = await createTestUser({ role: Role.user });
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/user/bookmarks/route");
    const req = new NextRequest("http://localhost/api/user/bookmarks", {
      method: "POST",
      body: JSON.stringify({ jobId: job.id }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_jobId: { userId: user.id, jobId: job.id } },
    });
    expect(bookmark).not.toBeNull();
  });

  it("toggle delete — second POST removes bookmark", async () => {
    const user = await createTestUser({ role: Role.user });
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/user/bookmarks/route");
    const req1 = new NextRequest("http://localhost/api/user/bookmarks", {
      method: "POST",
      body: JSON.stringify({ jobId: job.id }),
    });
    await POST(req1);

    const req2 = new NextRequest("http://localhost/api/user/bookmarks", {
      method: "POST",
      body: JSON.stringify({ jobId: job.id }),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);

    const count = await prisma.bookmark.count({ where: { userId: user.id, jobId: job.id } });
    expect(count).toBe(0);
  });

  it("list bookmarks returns all user bookmarks", async () => {
    const user = await createTestUser({ role: Role.user });
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);

    const job1 = await createTestJob(recruiter.id, company.id, { title: "Job 1" });
    const job2 = await createTestJob(recruiter.id, company.id, { title: "Job 2" });
    const job3 = await createTestJob(recruiter.id, company.id, { title: "Job 3" });

    await prisma.bookmark.createMany({
      data: [
        { userId: user.id, jobId: job1.id },
        { userId: user.id, jobId: job2.id },
        { userId: user.id, jobId: job3.id },
      ],
    });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/user/bookmarks/route");
    const req = new NextRequest("http://localhost/api/user/bookmarks");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(3);
  });

  it("concurrent toggle — @@unique prevents duplicates", async () => {
    const user = await createTestUser({ role: Role.user });
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/user/bookmarks/route");

    const results = await Promise.allSettled([
      POST(new NextRequest("http://localhost/api/user/bookmarks", {
        method: "POST",
        body: JSON.stringify({ jobId: job.id }),
      })),
      POST(new NextRequest("http://localhost/api/user/bookmarks", {
        method: "POST",
        body: JSON.stringify({ jobId: job.id }),
      })),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled" && r.value.status === 200);
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);

    const count = await prisma.bookmark.count({ where: { userId: user.id, jobId: job.id } });
    expect(count).toBeLessThanOrEqual(1);
  });
});
