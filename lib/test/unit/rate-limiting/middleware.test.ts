import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWithRateLimit } from "@/lib/rate-limiting/middleware";
import type { RateLimiter, RateLimitResult } from "@/lib/rate-limiting/types";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/app/features/auth/libs/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/rate-limiting/metrics", () => ({
  countRateLimitDecision: vi.fn(),
  recordCheckDuration: vi.fn(),
  recordDbLatency: vi.fn(),
  startCheckSpan: vi.fn(() => ({ setAttribute: vi.fn(), end: vi.fn() })),
  endCheckSpan: vi.fn(),
  recordSpanError: vi.fn(),
}));

vi.mock("@/lib/rate-limiting/telemetry", () => ({
  runWithTraceContext: vi.fn((_ctx: unknown, fn: () => Promise<unknown>) => fn()),
  generateRequestId: vi.fn(() => "test-request-id"),
}));

vi.mock("@/lib/rate-limiting/request-context", () => ({
  runWithSessionCache: vi.fn((_cache: unknown, fn: () => Promise<unknown>) => fn()),
}));

import { getSession } from "@/app/features/auth/libs/auth";

describe("createWithRateLimit", () => {
  let mockRateLimiter: RateLimiter;
  let withRateLimit: ReturnType<typeof createWithRateLimit>;
  let handler: (request: NextRequest) => Promise<NextResponse>;
  const mockSession = {
    user: { id: "user-1", name: "Test", email: "test@test.com", role: "user" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);

    mockRateLimiter = {
      check: vi
        .fn()
        .mockResolvedValue({
          allowed: true,
          limit: 10,
          remaining: 9,
          reset: 1000,
          retryAfter: 0,
        } as RateLimitResult),
      enforce: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(undefined),
      prune: vi.fn().mockResolvedValue(undefined),
    };

    withRateLimit = createWithRateLimit(mockRateLimiter);

    handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
  });

  it("passes request to handler when rate limit is not exceeded", async () => {
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    const response = await wrapped(request);
    expect(response.status).toBe(200);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockRateLimiter.check = vi
      .fn()
      .mockResolvedValue({
        allowed: false,
        limit: 10,
        remaining: 0,
        reset: 2000,
        retryAfter: 10,
      } as RateLimitResult);
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    const response = await wrapped(request);
    expect(response.status).toBe(429);
  });

  it("includes rate limit headers on 429 response", async () => {
    mockRateLimiter.check = vi
      .fn()
      .mockResolvedValue({
        allowed: false,
        limit: 5,
        remaining: 0,
        reset: 2000,
        retryAfter: 10,
      } as RateLimitResult);
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    const response = await wrapped(request);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("includes rate limit headers on success response", async () => {
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    const response = await wrapped(request);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("9");
  });

  it("passes through when rate limiting is disabled", async () => {
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    await wrapped(request);
    expect(handler).toHaveBeenCalled();
  });

  it("applies anonymous multiplier for unauthenticated requests", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    mockRateLimiter.check = vi
      .fn()
      .mockResolvedValue({
        allowed: true,
        limit: 30,
        remaining: 29,
        reset: 1000,
        retryAfter: 0,
      } as RateLimitResult);
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    await wrapped(request);
    expect(mockRateLimiter.check).toHaveBeenCalled();
  });

  it("applies recruiter multiplier", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "rec-1", name: "Rec", email: "rec@co.com", role: "recruiter" },
    });
    mockRateLimiter.check = vi
      .fn()
      .mockResolvedValue({
        allowed: true,
        limit: 60,
        remaining: 59,
        reset: 1000,
        retryAfter: 0,
      } as RateLimitResult);
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    await wrapped(request);
    expect(mockRateLimiter.check).toHaveBeenCalledWith(
      expect.any(String),
      200,
      expect.any(Number),
    );
  });

  it("applies admin multiplier", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "adm-1", name: "Admin", email: "adm@co.com", role: "admin" },
    });
    mockRateLimiter.check = vi
      .fn()
      .mockResolvedValue({
        allowed: true,
        limit: 500,
        remaining: 499,
        reset: 1000,
        retryAfter: 0,
      } as RateLimitResult);
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    await wrapped(request);
    expect(mockRateLimiter.check).toHaveBeenCalledWith(
      expect.any(String),
      500,
      expect.any(Number),
    );
  });

  it("applies super_admin multiplier", async () => {
    (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "sa-1", name: "Super", email: "sa@co.com", role: "super_admin" },
    });
    mockRateLimiter.check = vi
      .fn()
      .mockResolvedValue({
        allowed: true,
        limit: 1000,
        remaining: 999,
        reset: 1000,
        retryAfter: 0,
      } as RateLimitResult);
    const wrapped = withRateLimit(handler, "jobs:view");
    const request = new NextRequest(new Request("http://localhost/api/jobs/test/view"));
    await wrapped(request);
    expect(mockRateLimiter.check).toHaveBeenCalledWith(
      expect.any(String),
      1000,
      expect.any(Number),
    );
  });
});
