import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows requests under the limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 9; i++) {
      expect(() => checkRateLimit("test-key")).not.toThrow();
    }
  });

  it("blocks requests at the limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 10; i++) {
      checkRateLimit("test-key");
    }
    expect(() => checkRateLimit("test-key")).toThrow("Too many requests");
  });

  it("isolates limits by key (RL2)", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 10; i++) {
      checkRateLimit("key-a");
    }
    expect(() => checkRateLimit("key-a")).toThrow("Too many requests");
    expect(() => checkRateLimit("key-b")).not.toThrow();
  });

  it("tracks concurrent requests in same millisecond (RL3)", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = "concurrent-key";
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key);
    }
    expect(() => checkRateLimit(key)).toThrow("Too many requests");
  });

  it("resets after the window expires", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 10; i++) {
      checkRateLimit("window-key");
    }
    expect(() => checkRateLimit("window-key")).toThrow("Too many requests");
    vi.advanceTimersByTime(60001);
    expect(() => checkRateLimit("window-key")).not.toThrow();
    vi.useRealTimers();
  });

  it("accepts custom config", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    expect(() => checkRateLimit("custom-key", { max: 2, windowMs: 5000 })).not.toThrow();
    checkRateLimit("custom-key", { max: 2, windowMs: 5000 });
    expect(() => checkRateLimit("custom-key", { max: 2, windowMs: 5000 })).toThrow("Too many requests");
  });

  it("supports max:0 — rejects all requests (RL5)", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    expect(() => checkRateLimit("zero-key", { max: 0 })).toThrow("Too many requests");
  });
});

describe("pruneRateLimitStores", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("removes stale entries older than 1 hour (RL4)", async () => {
    const { checkRateLimit, pruneRateLimitStores, _resetRateLimitStores } = await import("@/lib/rate-limit");
    checkRateLimit("stale-key");
    checkRateLimit("fresh-key");
    vi.advanceTimersByTime(3600001);
    checkRateLimit("fresh-key");
    pruneRateLimitStores();
    const { checkRateLimit: checkAgain } = await import("@/lib/rate-limit");
    expect(() => checkAgain("stale-key")).not.toThrow();
    _resetRateLimitStores();
  });
});

describe("_resetRateLimitStores", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("clears all stores", async () => {
    const { checkRateLimit, _resetRateLimitStores } = await import("@/lib/rate-limit");
    for (let i = 0; i < 10; i++) {
      checkRateLimit("reset-key");
    }
    expect(() => checkRateLimit("reset-key")).toThrow("Too many requests");
    _resetRateLimitStores();
    expect(() => checkRateLimit("reset-key")).not.toThrow();
  });
});

describe("RL1 — Restart resets counters", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("clearing stores simulates process restart — fresh counter starts at 0", async () => {
    const mod = await import("@/lib/rate-limit");
    for (let i = 0; i < 10; i++) {
      mod.checkRateLimit("restart-key");
    }
    expect(() => mod.checkRateLimit("restart-key")).toThrow("Too many requests");
    mod._resetRateLimitStores();
    vi.resetModules();
    const freshMod = await import("@/lib/rate-limit");
    expect(() => freshMod.checkRateLimit("restart-key")).not.toThrow();
  });
});
