import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  mockSession,
  resetDb,
  createTestUser,
  createTestCompany,
  createTestJob,
  createTestApplication,
  createTestResume,
  createTestMessage,
} from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { computeThreadId } from "@/lib/thread-utils";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

describe("IDOR — Cross-Tenant Recruiter Isolation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("recruiter A cannot access recruiter B's job detail", async () => {
    const [recruiterA] = await seedRecruiterCompany();
    const [, , jobB] = await seedRecruiterCompany();

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { GET } = await import("@/app/api/recruiter/jobs/[id]/route");
    const req = new NextRequest(`http://localhost/api/recruiter/jobs/${jobB.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: jobB.id }) });
    expect(res.status).toBe(400);
  });

  it("recruiter A cannot access recruiter B's applicant detail", async () => {
    const [recruiterA] = await seedRecruiterCompany();
    const [, , jobB] = await seedRecruiterCompany();
    const applicant = await createTestUser({ role: Role.user });
    const appB = await createTestApplication(jobB.id, applicant.id);

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { GET } = await import("@/app/api/recruiter/applications/[applicationId]/detail/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${appB.id}/detail`);
    const res = await GET(req, { params: Promise.resolve({ applicationId: appB.id }) });
    expect(res.status).toBe(404);
  });

  it("recruiter A cannot transition recruiter B's applicant status", async () => {
    const [recruiterA] = await seedRecruiterCompany();
    const [, , jobB] = await seedRecruiterCompany();
    const applicant = await createTestUser({ role: Role.user });
    const appB = await createTestApplication(jobB.id, applicant.id);

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { PATCH } = await import("@/app/api/recruiter/applications/[applicationId]/status/route");
    const req = new NextRequest(`http://localhost/api/recruiter/applications/${appB.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "reviewing" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ applicationId: appB.id }) });
    expect(res.status).toBe(400);
  });

  it("recruiter A cannot list applicants for recruiter B's job", async () => {
    const [recruiterA] = await seedRecruiterCompany();
    const [, , jobB] = await seedRecruiterCompany();

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { GET } = await import("@/app/api/recruiter/jobs/[id]/applicants/route");
    const req = new NextRequest(`http://localhost/api/recruiter/jobs/${jobB.id}/applicants`);
    const res = await GET(req, { params: Promise.resolve({ id: jobB.id }) });
    expect(res.status).toBe(404);
  });

  it("recruiter A sees only own analytics", async () => {
    const [recruiterA, companyA] = await seedRecruiterCompany();
    await createTestJob(recruiterA.id, companyA.id, { title: "A-Job" });

    await seedRecruiterCompany();

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { GET } = await import("@/app/api/recruiter/analytics/route");
    const req = new NextRequest("http://localhost/api/recruiter/analytics");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

describe("IDOR — User Resource Isolation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("user A cannot access user B's resume", async () => {
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

  it("user A cannot access user B's application detail", async () => {
    const userA = await createTestUser({ role: Role.user });
    const { application: appB } = await seedUserApplication();

    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));

    const { GET } = await import("@/app/api/user/applications/[id]/route");
    const req = new NextRequest(`http://localhost/api/user/applications/${appB.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: appB.id }) });
    expect(res.status).toBe(404);
  });

  it("user A cannot withdraw user B's application", async () => {
    const userA = await createTestUser({ role: Role.user });
    const { application: appB } = await seedUserApplication();

    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));

    const { DELETE } = await import("@/app/api/user/applications/[id]/route");
    const req = new NextRequest(`http://localhost/api/user/applications/${appB.id}`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: appB.id }) });
    expect(res.status).toBe(404);
  });

  it("user A cannot see user B's bookmark", async () => {
    const userA = await createTestUser({ role: Role.user });
    const userB = await createTestUser({ role: Role.user });
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);

    mockGetSession.mockResolvedValue(mockSession("user", { id: userB.id }));
    const { POST } = await import("@/app/api/user/bookmarks/route");
    const postReq = new NextRequest("http://localhost/api/user/bookmarks", {
      method: "POST",
      body: JSON.stringify({ jobId: job.id }),
    });
    await POST(postReq);

    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));
    const { GET: GetBookmark } = await import("@/app/api/user/bookmarks/[jobId]/route");
    const getReq = new NextRequest(`http://localhost/api/user/bookmarks/${job.id}`);
    const res = await GetBookmark(getReq, { params: Promise.resolve({ jobId: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toMatchObject({ bookmarked: false });
  });

  it("user A cannot see user B's notifications", async () => {
    const userA = await createTestUser({ role: Role.user });
    const userB = await createTestUser({ role: Role.user });

    await prisma.notification.create({
      data: { userId: userB.id, type: "application_status", data: { note: "B notification" } },
    });

    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));

    const { GET } = await import("@/app/api/notifications/route");
    const req = new NextRequest("http://localhost/api/notifications?take=50");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    const items = body.data.notifications;
    const hasBData = items.some(
      (n: { data: Record<string, unknown> }) => n.data?.note === "B notification",
    );
    expect(hasBData).toBe(false);
  });
});

describe("IDOR — Message Thread Isolation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("user A cannot access thread between user B and recruiter", async () => {
    const userA = await createTestUser({ role: Role.user });
    const userB = await createTestUser({ role: Role.user });
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);

    const threadId = computeThreadId(userB.id, recruiter.id);
    await createTestMessage(threadId, { senderId: recruiter.id, receiverId: userB.id });

    mockGetSession.mockResolvedValue(mockSession("user", { id: userA.id }));

    const { GET } = await import("@/app/api/recruiter/messages/[threadId]/route");
    const req = new NextRequest(`http://localhost/api/recruiter/messages/${threadId}`);
    const res = await GET(req, { params: Promise.resolve({ threadId }) });
    expect(res.status).toBe(400);
  });

  it("recruiter A cannot access thread between user and recruiter B", async () => {
    const user = await createTestUser({ role: Role.user });
    const recruiterA = await createTestUser({ role: Role.recruiter });
    const companyA = await createTestCompany(recruiterA.id);

    const recruiterB = await createTestUser({ role: Role.recruiter });
    const threadId = computeThreadId(user.id, recruiterB.id);
    await createTestMessage(threadId, { senderId: recruiterB.id, receiverId: user.id });

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { GET } = await import("@/app/api/recruiter/messages/[threadId]/route");
    const req = new NextRequest(`http://localhost/api/recruiter/messages/${threadId}`);
    const res = await GET(req, { params: Promise.resolve({ threadId }) });
    expect(res.status).toBe(400);
  });
});

describe("IDOR — Admin Resource Isolation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("admin cannot modify extra fields via role POST (mass assignment)", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const targetUser = await createTestUser({ role: Role.user });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { POST } = await import("@/app/api/admin/users/[id]/role/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${targetUser.id}/role`, {
      method: "POST",
      body: JSON.stringify({ role: "recruiter", banned: true, name: "Hacked" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: targetUser.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.roleSet).toBe("recruiter");

    const updated = await prisma.user.findUnique({ where: { id: targetUser.id } });
    expect(updated?.banned).toBe(false);
    expect(updated?.name).not.toBe("Hacked");
  });

  it("admin can access user detail", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const targetUser = await createTestUser({ role: Role.user });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { GET } = await import("@/app/api/admin/users/[id]/route");
    const req = new NextRequest(`http://localhost/api/admin/users/${targetUser.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: targetUser.id }) });
    expect(res.status).toBe(200);
  });
});

async function seedRecruiterCompany() {
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  return [recruiter, company, job] as const;
}

async function seedUserApplication() {
  const user = await createTestUser({ role: Role.user });
  const recruiter = await createTestUser({ role: Role.recruiter });
  const company = await createTestCompany(recruiter.id);
  const job = await createTestJob(recruiter.id, company.id);
  const application = await createTestApplication(job.id, user.id);
  return { user, application };
}
