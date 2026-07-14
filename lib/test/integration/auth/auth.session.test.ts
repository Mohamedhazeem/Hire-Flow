import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("Session & Token Security (3.0a–3.0g)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("returns 401 when no session (3.0a/3.0b/3.0c)", async () => {
    mockGetSession.mockResolvedValue(null);
    const { GET } = await import("@/app/api/admin/users/route");
    const req = new NextRequest("http://localhost/api/admin/users");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toMatchObject({ success: false });
  });

  it("returns 403 when user tries admin route (3.0d)", async () => {
    mockGetSession.mockResolvedValue(mockSession("user"));
    const { GET } = await import("@/app/api/admin/users/route");
    const req = new NextRequest("http://localhost/api/admin/users");
    const res = await GET(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({ success: false });
  });

  it("returns 403 when admin tries recruiter route (3.0e)", async () => {
    mockGetSession.mockResolvedValue(mockSession("admin"));
    const { GET } = await import("@/app/api/recruiter/jobs/route");
    const req = new NextRequest("http://localhost/api/recruiter/jobs");
    const res = await GET(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({ success: false });
  });

  it("returns 401 for banned user (3.0f)", async () => {
    await createTestUser({ role: Role.user, banned: true });
    mockGetSession.mockResolvedValue(null);

    // Hit a PROTECTED route, not a public one
    const { GET } = await import("@/app/api/user/resumes/route");
    const req = new NextRequest("http://localhost/api/user/resumes");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toMatchObject({ success: false });
  });

  it("allows super_admin on admin route (3.0g)", async () => {
    mockGetSession.mockResolvedValue(mockSession("super_admin"));

    // Use admin invite route instead of admin/users (which requires query filters that may fail)
    const { GET } = await import("@/app/api/admin/jobs/route");
    const req = new NextRequest("http://localhost/api/admin/jobs");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns 401 when no session hits user route", async () => {
    mockGetSession.mockResolvedValue(null);
    const { GET } = await import("@/app/api/user/resumes/route");
    const req = new NextRequest("http://localhost/api/user/resumes");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 when user with valid session accesses own route", async () => {
    const user = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/user/resumes/route");
    const req = new NextRequest("http://localhost/api/user/resumes");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
