import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { mockSession, resetDb, createTestUser } from "@/lib/test";
import { Role } from "@/app/generated/prisma/client";
import { mockGetSession } from "@/lib/test/shared-auth-mock";

vi.mock("@/lib/upload", () => ({
  saveUpload: vi.fn().mockResolvedValue({
    url: "/uploads/mock-file.pdf",
    filename: "mock-file.pdf",
    size: 1024,
    mimeType: "application/pdf",
  }),
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
});
