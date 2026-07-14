import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSession = vi.fn();
vi.mock("@/app/features/auth/libs/auth", () => ({
  getSession: mockSession,
}));

const mockFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    companyTeamMember: {
      findUnique: mockFindUnique,
    },
  },
}));

describe("requireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns session when admin role matches", async () => {
    mockSession.mockResolvedValue({
      user: { id: "1", name: "Admin", email: "admin@test.com", role: "admin" },
    });
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    const result = await requireRole(["admin"]);
    expect(result.role).toBe("admin");
    expect(result.id).toBe("1");
    expect(result.name).toBe("Admin");
  });

  it("throws UnauthorizedError when no session", async () => {
    mockSession.mockResolvedValue(null);
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    await expect(requireRole(["admin"])).rejects.toThrow("Authentication required");
  });

  it("throws ForbiddenError when role is not allowed", async () => {
    mockSession.mockResolvedValue({
      user: { id: "2", name: "User", email: "user@test.com", role: "user" },
    });
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    await expect(requireRole(["admin"])).rejects.toThrow("Insufficient permissions");
  });

  it("returns session with companyId for recruiter with membership", async () => {
    mockSession.mockResolvedValue({
      user: { id: "3", name: "Recruiter", email: "rec@test.com", role: "recruiter" },
    });
    mockFindUnique.mockResolvedValue({ companyId: "c1", role: "admin" });
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    const result = await requireRole(["recruiter"]);
    expect(result.companyId).toBe("c1");
    expect(result.memberRole).toBe("admin");
  });

  it("throws ForbiddenError when recruiter has no membership", async () => {
    mockSession.mockResolvedValue({
      user: { id: "4", name: "NoCompany", email: "no@test.com", role: "recruiter" },
    });
    mockFindUnique.mockResolvedValue(null);
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    await expect(requireRole(["admin"])).rejects.toThrow("Insufficient permissions");
  });

  it("throws ForbiddenError when admin tries recruiter guard without membership", async () => {
    mockSession.mockResolvedValue({
      user: { id: "5", name: "Admin", email: "admin@test.com", role: "admin" },
    });
    mockFindUnique.mockResolvedValue(null);
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    await expect(requireRole(["recruiter"])).rejects.toThrow("Insufficient permissions");
  });

  it("throws ForbiddenError when super_admin tries admin guard (super_admin not in allowed list)", async () => {
    mockSession.mockResolvedValue({
      user: { id: "6", name: "Super", email: "super@test.com", role: "super_admin" },
    });
    mockFindUnique.mockResolvedValue(null);
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    await expect(requireRole(["admin"])).rejects.toThrow("Insufficient permissions");
  });

  it("finds membership for recruiter in the recruiter-fallback path", async () => {
    mockSession.mockResolvedValue({
      user: { id: "7", name: "Recruiter2", email: "r2@test.com", role: "recruiter" },
    });
    mockFindUnique.mockResolvedValue({ companyId: "c2", role: "member" });
    const { requireRole } = await import("@/app/features/shared/api/require-role");
    const result = await requireRole(["recruiter"]);
    expect(result.companyId).toBe("c2");
  });
});
