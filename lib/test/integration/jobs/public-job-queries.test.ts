import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetDb, createTestUser, createTestCompany, createTestJob } from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";

describe("Public Job Queries (Phase 4.2)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("excludes draft jobs from listing (priority 2 - dual gate)", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Active Job" });
    await createTestJob(recruiter.id, company.id, { title: "Draft Job", status: "draft" });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
    expect(body.data.jobs[0].title).toBe("Active Job");
  });

  it("excludes archived jobs from listing", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Active Job" });
    await createTestJob(recruiter.id, company.id, { title: "Archived Job", status: "archived" });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
  });

  it("excludes isActive:false jobs from listing", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Active Job" });
    await createTestJob(recruiter.id, company.id, { title: "Deactivated Job", isActive: false });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
  });

  it("dual gate: isActive=false + status=active still excluded", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Active Job" });
    await createTestJob(recruiter.id, company.id, { title: "Killed Job", status: "active", isActive: false });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
  });

  it("dual gate: status=draft + isActive=true still excluded", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Active Job" });
    await createTestJob(recruiter.id, company.id, { title: "Draft but active", status: "draft", isActive: true });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
  });

  it("pagination returns correct count and pageSize", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    for (let i = 0; i < 25; i++) {
      await createTestJob(recruiter.id, company.id, { title: `Job ${i}` });
    }

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs?pageSize=20");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(20);
    expect(body.data.total).toBe(25);
  });

  it("search filters by title", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Frontend Engineer" });
    await createTestJob(recruiter.id, company.id, { title: "Backend Engineer" });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs?search=Frontend");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
    expect(body.data.jobs[0].title).toContain("Frontend");
  });

  it("S2: empty search returns all results (not none)", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Alpha Engineer" });
    await createTestJob(recruiter.id, company.id, { title: "Beta Engineer" });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest("http://localhost/api/jobs?search=");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(2);
    expect(body.data.total).toBe(2);
  });

  it("S2: all-punctuation search returns all results (query sanitizes to empty)", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Alpha Engineer" });
    await createTestJob(recruiter.id, company.id, { title: "Beta Engineer" });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest(
      `http://localhost/api/jobs?search=${encodeURIComponent("&|!*()")}`,
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(2);
  });

  it("S3: very long search string does not crash and returns matches", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, {
      title: "Distinctive Frontend Engineer",
    });

    // Real term followed by thousands of characters — must be bounded, not error.
    const longSearch = `Distinctive ${"x".repeat(5000)}`;
    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest(
      `http://localhost/api/jobs?search=${encodeURIComponent(longSearch)}`,
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
    expect(body.data.jobs[0].title).toContain("Distinctive");
  });

  it("S4: unicode search terms match unicode job titles", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    await createTestJob(recruiter.id, company.id, { title: "Ingeniería de Software" });
    await createTestJob(recruiter.id, company.id, { title: "Plain English Job" });

    const { GET } = await import("@/app/api/jobs/route");
    const req = new NextRequest(
      `http://localhost/api/jobs?search=${encodeURIComponent("Ingeniería")}`,
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.jobs).toHaveLength(1);
    expect(body.data.jobs[0].title).toContain("Ingeniería");
  });

  it("single job detail returns job", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);

    const { GET } = await import("@/app/api/jobs/[id]/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(job.id);
  });

  it("single job detail returns 404 for missing job", async () => {
    const { GET } = await import("@/app/api/jobs/[id]/route");
    const req = new NextRequest("http://localhost/api/jobs/00000000-0000-0000-0000-000000000000");
    const res = await GET(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }) });
    expect(res.status).toBe(404);
  });

  it("single job detail returns 404 for draft job", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id, { status: "draft" });

    const { GET } = await import("@/app/api/jobs/[id]/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(404);
  });
});
