import { describe, it, expect } from "vitest";

describe("rate limit config", () => {
  it("validates correct config without throwing", async () => {
    const { validateConfig } = await import("@/lib/rate-limiting/config");
    expect(() => validateConfig()).not.toThrow();
  });

  it("freezes config after validation", async () => {
    const { rateLimitConfig, freezeConfig } = await import("@/lib/rate-limiting/config");
    freezeConfig();
    expect(Object.isFrozen(rateLimitConfig)).toBe(true);
    expect(Object.isFrozen(rateLimitConfig.endpoints)).toBe(true);
  });

  it("has default failStrategy values", async () => {
    const { rateLimitConfig } = await import("@/lib/rate-limiting/config");
    expect(rateLimitConfig.failStrategy.default).toMatch(/^(open|closed)$/);
    expect(rateLimitConfig.failStrategy.statusCode).toBeGreaterThanOrEqual(400);
    expect(rateLimitConfig.failStrategy.statusCode).toBeLessThanOrEqual(599);
  });

  it("has cleanup config with valid batchSize", async () => {
    const { rateLimitConfig } = await import("@/lib/rate-limiting/config");
    expect(rateLimitConfig.cleanup.batchSize).toBeGreaterThanOrEqual(100);
    expect(rateLimitConfig.cleanup.batchSize).toBeLessThanOrEqual(100_000);
    expect(rateLimitConfig.cleanup.budgetMs).toBeGreaterThan(0);
  });

  it("has valid role multipliers", async () => {
    const { rateLimitConfig } = await import("@/lib/rate-limiting/config");
    for (const cfg of Object.values(rateLimitConfig.roles)) {
      expect(cfg.multiplier).toBeGreaterThan(0);
      expect(Number.isFinite(cfg.multiplier)).toBe(true);
    }
  });

  it("has valid endpoint limits", async () => {
    const { rateLimitConfig } = await import("@/lib/rate-limiting/config");
    for (const ep of Object.values(rateLimitConfig.endpoints)) {
      expect(ep.max).toBeGreaterThan(0);
      expect(ep.windowMs).toBeGreaterThan(0);
      const epCfg = ep as { failStrategy?: "open" | "closed" };
      if (epCfg.failStrategy) {
        expect(["open", "closed"]).toContain(epCfg.failStrategy);
      }
    }
  });
});
