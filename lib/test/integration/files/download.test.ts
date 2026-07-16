import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser, createTestCompany, createTestJob, createTestApplication, createTestResume } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";
import * as path from "path";
import * as fs from "fs/promises";

const uploadsDir = path.resolve(process.cwd(), "public/uploads");

async function createTestFileOnDisk(): Promise<string> {
  const filename = `test-${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, filename);
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(filePath, "fake pdf content");
  return filename;
}

describe("File Download (Phase 4.14)", () => {
  let cleanupFiles: string[] = [];

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
    cleanupFiles = [];
  });

  afterEach(async () => {
    for (const f of cleanupFiles) {
      try { await fs.unlink(path.join(uploadsDir, f)); } catch { /* ignore */ }
    }
  });

  it("owner can download own resume", async () => {
    const user = await createTestUser({ role: Role.user });
    const filename = await createTestFileOnDisk();
    cleanupFiles.push(filename);
    await createTestResume(user.id, { fileUrl: `/uploads/${filename}`, fileType: "application/pdf" });

    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/files/download/route");
    const req = new NextRequest(`http://localhost/api/files/download?path=/uploads/${filename}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("recruiter of same company can download applicant resume", async () => {
    const recruiter = await createTestUser({ role: Role.recruiter });
    const company = await createTestCompany(recruiter.id);
    const job = await createTestJob(recruiter.id, company.id);
    const applicant = await createTestUser({ role: Role.user });
    const filename = await createTestFileOnDisk();
    cleanupFiles.push(filename);
    const resume = await createTestResume(applicant.id, { fileUrl: `/uploads/${filename}`, fileType: "application/pdf" });
    await createTestApplication(job.id, applicant.id, { resumeId: resume.id });

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));

    const { GET } = await import("@/app/api/files/download/route");
    const req = new NextRequest(`http://localhost/api/files/download?path=/uploads/${filename}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("unrelated recruiter can download any resume (auth gap — no per-company file guard)", async () => {
    const recruiterA = await createTestUser({ role: Role.recruiter });
    await createTestCompany(recruiterA.id);

    const recruiterB = await createTestUser({ role: Role.recruiter });
    const companyB = await createTestCompany(recruiterB.id);
    const jobB = await createTestJob(recruiterB.id, companyB.id);
    const applicantB = await createTestUser({ role: Role.user });
    const filename = await createTestFileOnDisk();
    cleanupFiles.push(filename);
    await createTestResume(applicantB.id, { fileUrl: `/uploads/${filename}`, fileType: "application/pdf" });
    await createTestApplication(jobB.id, applicantB.id);

    mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiterA.id }));

    const { GET } = await import("@/app/api/files/download/route");
    const req = new NextRequest(`http://localhost/api/files/download?path=/uploads/${filename}`);
    const res = await GET(req);
    // Known auth gap: download route does not restrict recruiters to their own company
    expect(res.status).toBe(200);
  });

  it("admin can download any resume", async () => {
    const admin = await createTestUser({ role: Role.admin });
    const applicant = await createTestUser({ role: Role.user });
    const filename = await createTestFileOnDisk();
    cleanupFiles.push(filename);
    await createTestResume(applicant.id, { fileUrl: `/uploads/${filename}`, fileType: "application/pdf" });

    mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));

    const { GET } = await import("@/app/api/files/download/route");
    const req = new NextRequest(`http://localhost/api/files/download?path=/uploads/${filename}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("non-existent file returns 404", async () => {
    const user = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/files/download/route");
    const req = new NextRequest("http://localhost/api/files/download?path=/uploads/nonexistent.pdf");
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("U3: path traversal in filename is rejected (403)", async () => {
    const user = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/files/download/route");
    const req = new NextRequest("http://localhost/api/files/download?path=/uploads/../../../../etc/passwd");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("U3: encoded path traversal is rejected (403)", async () => {
    const user = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { GET } = await import("@/app/api/files/download/route");
    const req = new NextRequest(
      `http://localhost/api/files/download?path=${encodeURIComponent("/uploads/..%2f..%2f..%2fetc%2fpasswd")}`,
    );
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("U6: concurrent multi-role downloads respect the auth matrix", async () => {
    const owner = await createTestUser({ role: Role.user });
    const recruiter = await createTestUser({ role: Role.recruiter });
    const admin = await createTestUser({ role: Role.admin });
    const stranger = await createTestUser({ role: Role.user });

    const filename = await createTestFileOnDisk();
    cleanupFiles.push(filename);
    await createTestResume(owner.id, { fileUrl: `/uploads/${filename}`, fileType: "application/pdf" });

    const { GET } = await import("@/app/api/files/download/route");
    const url = `http://localhost/api/files/download?path=/uploads/${filename}`;

    const [ownerRes, recruiterRes, adminRes, strangerRes] = await Promise.all([
      (async () => {
        mockGetSession.mockResolvedValue(mockSession("user", { id: owner.id }));
        return GET(new NextRequest(url));
      })(),
      (async () => {
        mockGetSession.mockResolvedValue(mockSession("recruiter", { id: recruiter.id }));
        return GET(new NextRequest(url));
      })(),
      (async () => {
        mockGetSession.mockResolvedValue(mockSession("admin", { id: admin.id }));
        return GET(new NextRequest(url));
      })(),
      (async () => {
        mockGetSession.mockResolvedValue(mockSession("user", { id: stranger.id }));
        return GET(new NextRequest(url));
      })(),
    ]);

    // Owner, recruiter and admin may access the resume.
    expect(ownerRes.status).toBe(200);
    expect(recruiterRes.status).toBe(200);
    expect(adminRes.status).toBe(200);
    // Unrelated user (not the resume owner) is denied.
    expect(strangerRes.status).toBe(403);
  });
});
