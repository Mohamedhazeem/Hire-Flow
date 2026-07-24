import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetDb, createTestUser, createTestCompany, createTestJob } from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";

describe("Job Related Endpoint (Phase 4.5)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("returns 404 for non-existent job", async () => {
    const { GET } = await import("@/app/api/jobs/[id]/related/route");
    const req = new NextRequest("http://localhost/api/jobs/00000000-0000-0000-0000-000000000000");
    const res = await GET(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }) });
    expect(res.status).toBe(404);
  });

  it("returns 404 for draft job", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id, { status: "draft" });

    const { GET } = await import("@/app/api/jobs/[id]/related/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(404);
  });

  it("returns empty arrays when no related jobs exist", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);

    const { GET } = await import("@/app/api/jobs/[id]/related/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.companyJobs).toEqual([]);
    expect(body.data.similarJobs).toEqual([]);
  });

  it("returns same-company jobs and excludes current", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id, { title: "Current Job" });
    await createTestJob(recruiter.id, company.id, { title: "Other Job A" });
    await createTestJob(recruiter.id, company.id, { title: "Other Job B" });

    const { GET } = await import("@/app/api/jobs/[id]/related/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.companyJobs).toHaveLength(2);
    expect(body.data.companyJobs.map((j: { title: string }) => j.title)).toEqual(["Other Job B", "Other Job A"]);
    expect(body.data.companyJobs.every((j: { companyName: string }) => j.companyName === company.name)).toBe(true);
  });

  it("returns similar jobs with overlapping skills", async () => {
    const recruiter1 = await createTestUser({ role: Role.recruiter });
    const company1 = await createTestCompany(recruiter1.id);
    const job = await createTestJob(recruiter1.id, company1.id, {
      title: "Current Job",
      skills: ["react", "typescript"],
      workMode: "hybrid",
      experienceLevel: "senior",
    });

    const recruiter2 = await createTestUser({ role: Role.recruiter });
    const company2 = await createTestCompany(recruiter2.id);
    const similarJob = await createTestJob(recruiter2.id, company2.id, {
      title: "Similar by skills",
      skills: ["react", "node"],
      workMode: "remote",
      experienceLevel: "mid",
    });
    const noOverlapJob = await createTestJob(recruiter2.id, company2.id, {
      title: "No overlap",
      skills: ["python", "django"],
      workMode: "remote",
      experienceLevel: "intern",
    });

    const { GET } = await import("@/app/api/jobs/[id]/related/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.similarJobs).toHaveLength(1);
    expect(body.data.similarJobs[0].title).toBe("Similar by skills");
  });

  it("returns similar jobs with same workMode", async () => {
    const recruiter1 = await createTestUser({ role: Role.recruiter });
    const company1 = await createTestCompany(recruiter1.id);
    const job = await createTestJob(recruiter1.id, company1.id, {
      title: "Current Job",
      skills: [],
      workMode: "hybrid",
      experienceLevel: "senior",
    });

    const recruiter2 = await createTestUser({ role: Role.recruiter });
    const company2 = await createTestCompany(recruiter2.id);
    await createTestJob(recruiter2.id, company2.id, {
      title: "Same mode",
      skills: [],
      workMode: "hybrid",
      experienceLevel: "mid",
    });
    await createTestJob(recruiter2.id, company2.id, {
      title: "Different mode",
      skills: [],
      workMode: "remote",
      experienceLevel: "mid",
    });

    const { GET } = await import("@/app/api/jobs/[id]/related/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.similarJobs).toHaveLength(1);
    expect(body.data.similarJobs[0].title).toBe("Same mode");
  });

  it("excludes same-company jobs from similar results", async () => {
    const recruiter1 = await createTestUser({ role: Role.recruiter });
    const company1 = await createTestCompany(recruiter1.id);
    const recruiter2 = await createTestUser({ role: Role.recruiter });
    const company2 = await createTestCompany(recruiter2.id);
    const job = await createTestJob(recruiter1.id, company1.id, {
      title: "Current Job",
      skills: ["react"],
    });
    await createTestJob(recruiter1.id, company1.id, {
      title: "Same company similar",
      skills: ["react"],
    });
    await createTestJob(recruiter2.id, company2.id, {
      title: "Different company similar",
      skills: ["react"],
    });

    const { GET } = await import("@/app/api/jobs/[id]/related/route");
    const req = new NextRequest(`http://localhost/api/jobs/${job.id}`);
    const res = await GET(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.similarJobs).toHaveLength(1);
    expect(body.data.similarJobs[0].title).toBe("Different company similar");
  });
});
