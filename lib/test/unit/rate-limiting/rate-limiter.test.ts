import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiterImpl } from "@/lib/rate-limiting/rate-limiter";
import { FakeClock } from "@/lib/rate-limiting/clock";
import { FakeRepository } from "@/lib/rate-limiting/repository.fake";
import { TooManyRequestsError } from "@/lib/api/api-error";

describe("RateLimiterImpl", () => {
  let rateLimiter: RateLimiterImpl;
  let clock: FakeClock;
  let repo: FakeRepository;

  beforeEach(() => {
    clock = new FakeClock(1_000_000_000_000);
    repo = new FakeRepository();
    rateLimiter = new RateLimiterImpl(repo, clock);
  });

  it("allows requests under the limit", async () => {
    const result = await rateLimiter.check("test:key", 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.limit).toBe(10);
  });

  it("blocks requests over the limit", async () => {
    for (let i = 0; i < 3; i++) {
      await rateLimiter.check("test:key2", 2, 60_000);
    }
    const result = await rateLimiter.check("test:key2", 2, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("enforce throws TooManyRequestsError when blocked", async () => {
    for (let i = 0; i < 2; i++) {
      await rateLimiter.check("test:key3", 1, 60_000);
    }
    await expect(rateLimiter.enforce("test:key3", 1, 60_000)).rejects.toThrow(TooManyRequestsError);
  });

  it("resets after window expiry", async () => {
    await rateLimiter.check("test:key4", 1, 60_000);
    const blocked = await rateLimiter.check("test:key4", 1, 60_000);
    expect(blocked.allowed).toBe(false);

    clock.advance(61_000);
    const allowed = await rateLimiter.check("test:key4", 1, 60_000);
    expect(allowed.allowed).toBe(true);
    expect(allowed.remaining).toBe(0);
  });

  it("reset clears a specific key", async () => {
    await rateLimiter.check("test:key5", 1, 60_000);
    await rateLimiter.reset("test:key5");
    const result = await rateLimiter.check("test:key5", 1, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("reset with no key clears all app keys", async () => {
    await rateLimiter.check("app:test:a", 1, 60_000);
    await rateLimiter.check("other:b", 1, 60_000);
    await rateLimiter.reset();
    const a = await rateLimiter.check("app:test:a", 1, 60_000);
    expect(a.allowed).toBe(true);
  });

  it("single clock capture ensures consistent retryAfter and reset", async () => {
    clock.setTime(5000);
    const result = await rateLimiter.check("test:clock", 10, 60_000);
    const expectedReset = Math.ceil((5000 + 60_000) / 1000);
    expect(result.reset).toBe(expectedReset);
    const expectedRetryAfter = Math.max(1, expectedReset - Math.ceil(5000 / 1000));
    expect(result.retryAfter).toBe(expectedRetryAfter);
  });
});
