import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCount = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      count: mockCount,
    },
  },
}));

describe("checkMessageRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows when under the limit", async () => {
    mockCount.mockResolvedValue(5);
    const { checkMessageRateLimit } = await import(
      "@/app/features/recruiter/libs/rate-limit-message"
    );
    await expect(checkMessageRateLimit("sender-1", "receiver-1")).resolves.not.toThrow();
    expect(mockCount).toHaveBeenCalledTimes(1);
    const callArg = mockCount.mock.calls[0][0];
    expect(callArg.where.senderId).toBe("sender-1");
    expect(callArg.where.receiverId).toBe("receiver-1");
    expect(callArg.where.createdAt.gte).toBeInstanceOf(Date);
  });

  it("throws TooManyRequestsError when at the limit", async () => {
    mockCount.mockResolvedValue(20);
    const { checkMessageRateLimit } = await import(
      "@/app/features/recruiter/libs/rate-limit-message"
    );
    await expect(checkMessageRateLimit("sender-1", "receiver-1")).rejects.toThrow(
      "Message limit reached",
    );
  });

  it("isolates rate limits per sender-receiver pair", async () => {
    mockCount.mockResolvedValue(20);
    const { checkMessageRateLimit } = await import(
      "@/app/features/recruiter/libs/rate-limit-message"
    );
    await expect(checkMessageRateLimit("sender-a", "receiver-b")).rejects.toThrow(
      "Message limit reached",
    );
    mockCount.mockResolvedValue(0);
    await expect(checkMessageRateLimit("sender-a", "receiver-c")).resolves.not.toThrow();
  });
});
