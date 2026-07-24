import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireRole = vi.fn();
vi.mock("@/app/features/shared/api/require-role", () => ({
  requireRole: mockRequireRole,
}));

const mockCount = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: { count: mockCount },
  },
}));

const { getUnreadMessageCount } = await import(
  "@/app/features/messages/actions/get-unread-message-count"
);

describe("getUnreadMessageCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct unread count for the authenticated user", async () => {
    mockRequireRole.mockResolvedValue({ id: "user-1" });
    mockCount.mockResolvedValue(5);
    const result = await getUnreadMessageCount();
    expect(result).toBe(5);
  });

  it("returns 0 when no unread messages exist", async () => {
    mockRequireRole.mockResolvedValue({ id: "user-1" });
    mockCount.mockResolvedValue(0);
    const result = await getUnreadMessageCount();
    expect(result).toBe(0);
  });

  it("filters by receiverId = user.id", async () => {
    mockRequireRole.mockResolvedValue({ id: "user-42" });
    mockCount.mockResolvedValue(3);
    await getUnreadMessageCount();
    expect(mockCount).toHaveBeenCalledWith({
      where: expect.objectContaining({ receiverId: "user-42" }),
    });
  });

  it("excludes read messages", async () => {
    mockRequireRole.mockResolvedValue({ id: "u1" });
    mockCount.mockResolvedValue(2);
    await getUnreadMessageCount();
    expect(mockCount).toHaveBeenCalledWith({
      where: expect.objectContaining({ read: false }),
    });
  });

  it("excludes deleted messages", async () => {
    mockRequireRole.mockResolvedValue({ id: "u1" });
    mockCount.mockResolvedValue(1);
    await getUnreadMessageCount();
    expect(mockCount).toHaveBeenCalledWith({
      where: expect.objectContaining({ deletedAt: null }),
    });
  });

  it("excludes messages hidden from the user", async () => {
    mockRequireRole.mockResolvedValue({ id: "u1" });
    mockCount.mockResolvedValue(4);
    await getUnreadMessageCount();
    expect(mockCount).toHaveBeenCalledWith({
      where: expect.objectContaining({
        NOT: { hiddenFor: { has: "u1" } },
      }),
    });
  });

  it("throws when not authenticated", async () => {
    mockRequireRole.mockRejectedValue(new Error("Authentication required"));
    await expect(getUnreadMessageCount()).rejects.toThrow("Authentication required");
  });

  it("propagates Prisma errors", async () => {
    mockRequireRole.mockResolvedValue({ id: "u1" });
    mockCount.mockRejectedValue(new Error("Connection lost"));
    await expect(getUnreadMessageCount()).rejects.toThrow("Connection lost");
  });
});
