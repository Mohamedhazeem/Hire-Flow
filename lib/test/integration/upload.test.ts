import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

const saveUploadMock = vi.fn().mockResolvedValue({
  url: "/uploads/mock-file.pdf",
  filename: "mock-file.pdf",
  size: 1024,
  mimeType: "application/pdf",
});

vi.mock("@/lib/upload", () => ({
  saveUpload: (...args: unknown[]) => saveUploadMock(...(args as [File])),
}));

describe("File Upload (Phase 4.17)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
  });

  it("no session returns 401", async () => {
    mockGetSession.mockResolvedValue(null);

    const { POST } = await import("@/app/api/upload/route");
    const formData = new FormData();
    formData.append("file", new Blob(["test content"], { type: "application/pdf" }), "test.pdf");
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("mock file upload succeeds with valid session", async () => {
    const user = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/upload/route");
    const formData = new FormData();
    formData.append("file", new Blob(["test content"], { type: "application/pdf" }), "test.pdf");
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("U5: corrupted multipart body returns 400 (ValidationError)", async () => {
    const user = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    const { POST } = await import("@/app/api/upload/route");
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: "this is not valid multipart/form-data",
      headers: { "content-type": "text/plain" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("saveUpload failure (e.g. rejected type) maps to 422, not 500", async () => {
    const user = await createTestUser({ role: Role.user });
    mockGetSession.mockResolvedValue(mockSession("user", { id: user.id }));

    vi.mocked(saveUploadMock).mockRejectedValueOnce(new Error('File type "application/octet-stream" is not allowed.'));

    const { POST } = await import("@/app/api/upload/route");
    const formData = new FormData();
    formData.append("file", new Blob(["x"], { type: "application/octet-stream" }), "evil.exe");
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});
