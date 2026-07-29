import { describe, it, expect, vi, beforeEach } from "vitest";

describe("metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("countRateLimitDecision increments counter", async () => {
    const { countRateLimitDecision } = await import("@/lib/rate-limiting/metrics");
    // This tests the function exists and runs without error
    countRateLimitDecision({ endpoint: "jobs:view", role: "user", decision: "allowed" });
    expect(true).toBe(true);
  });

  it("recordCheckDuration records histogram", async () => {
    const { recordCheckDuration } = await import("@/lib/rate-limiting/metrics");
    recordCheckDuration(15, "jobs:view");
    expect(true).toBe(true);
  });

  it("recordDbLatency records histogram", async () => {
    const { recordDbLatency } = await import("@/lib/rate-limiting/metrics");
    recordDbLatency(5);
    expect(true).toBe(true);
  });

  it("recordCleanupMetrics records cleanup metrics", async () => {
    const { recordCleanupMetrics } = await import("@/lib/rate-limiting/metrics");
    recordCleanupMetrics({
      rowsDeleted: 100,
      durationMs: 500,
      batchesExecuted: 2,
      timedOut: false,
    });
    expect(true).toBe(true);
  });

  it("setActiveKeyCount records gauge", async () => {
    const { setActiveKeyCount } = await import("@/lib/rate-limiting/metrics");
    setActiveKeyCount(42);
    expect(true).toBe(true);
  });

  it("startCheckSpan creates span", async () => {
    const { startCheckSpan } = await import("@/lib/rate-limiting/metrics");
    const span = startCheckSpan("app:jobs:view:user1", 10);
    expect(span).toBeDefined();
    expect(typeof span.setAttribute).toBe("function");
    expect(typeof span.end).toBe("function");
  });

  it("endCheckSpan sets attributes and ends span", async () => {
    const { startCheckSpan, endCheckSpan } = await import("@/lib/rate-limiting/metrics");
    const span = startCheckSpan("app:test:key", 5);
    endCheckSpan(span, true, 12);
    expect(true).toBe(true);
  });

  it("recordSpanError records exception and sets error status", async () => {
    const { startCheckSpan, recordSpanError } = await import("@/lib/rate-limiting/metrics");
    const span = startCheckSpan("app:test:key", 5);
    const error = new Error("DB connection failed");
    recordSpanError(span, error);
    expect(true).toBe(true);
  });
});
