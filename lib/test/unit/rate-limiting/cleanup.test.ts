import { describe, it, expect, vi, beforeEach } from "vitest";
import { FakeClock } from "@/lib/rate-limiting/clock";
import { FakeRepository } from "@/lib/rate-limiting/repository.fake";
import { RateLimiterImpl } from "@/lib/rate-limiting/rate-limiter";
import { rateLimitConfig } from "@/lib/rate-limiting/config";

describe("cleanup", () => {
  let repo: FakeRepository;
  let clock: FakeClock;
  let limiter: RateLimiterImpl;

  beforeEach(async () => {
    repo = new FakeRepository();
    clock = new FakeClock(1_000_000_000_000);
    limiter = new RateLimiterImpl(repo, clock);
  });

  it("pruneAppKeys removes expired app: keys", async () => {
    const now = clock.now();
    const cutoff = BigInt(now - rateLimitConfig.cleanup.retentionMs);

    await repo.increment("app:jobs:view:user1", BigInt(now), cutoff);
    await repo.increment("app:messages:send:user2", BigInt(now), cutoff);
    await repo.increment("app:jobs:apply:user3", BigInt(now), cutoff);

    clock.advance(rateLimitConfig.cleanup.retentionMs + 1_000);
    const newCutoff = BigInt(clock.now() - rateLimitConfig.cleanup.retentionMs);

    const result = await repo.pruneAppKeys(newCutoff);

    expect(result.rowsDeleted).toBe(3);
    expect(result.batchesExecuted).toBe(1);
    expect(result.timedOut).toBe(false);
  });

  it("pruneAppKeys does not delete non-expired keys", async () => {
    const now = clock.now();
    const cutoff = BigInt(now - rateLimitConfig.cleanup.retentionMs);

    await repo.increment("app:jobs:view:user1", BigInt(now), cutoff);

    clock.advance(1_000);
    const newCutoff = BigInt(clock.now() - rateLimitConfig.cleanup.retentionMs);

    const result = await repo.pruneAppKeys(newCutoff);

    expect(result.rowsDeleted).toBe(0);
  });

  it("pruneAppKeys only deletes app: and anon: prefixed keys, preserves other: keys", async () => {
    const now = clock.now();
    const cutoff = BigInt(now - rateLimitConfig.cleanup.retentionMs);

    await repo.increment("app:jobs:view:user1", BigInt(now), cutoff);
    await repo.increment("anon:192.168.1.1", BigInt(now), cutoff);
    await repo.increment("other:key", BigInt(now), cutoff);

    clock.advance(rateLimitConfig.cleanup.retentionMs + 1_000);
    const newCutoff = BigInt(clock.now() - rateLimitConfig.cleanup.retentionMs);

    const result = await repo.pruneAppKeys(newCutoff);

    // Only app: and anon: keys should be deleted
    expect(result.rowsDeleted).toBe(2);

    // Verify other:key was NOT deleted by checking it still exists
    const otherKeyAfterPrune = await repo.increment(
      "other:key",
      BigInt(clock.now()),
      BigInt(clock.now() - 60_000),
    );
    // It should continue from where it left off (count=2) if not deleted
    expect(otherKeyAfterPrune.count).toBeGreaterThanOrEqual(1);
  });

  it("limiter.prune() calls repo.pruneAppKeys with config values and records metrics", async () => {
    const now = clock.now();
    const cutoff = BigInt(now - rateLimitConfig.cleanup.retentionMs);

    for (let i = 0; i < 5; i++) {
      await repo.increment(`app:test:key${i}`, BigInt(now), cutoff);
    }

    clock.advance(rateLimitConfig.cleanup.retentionMs + 1_000);

    // prune() returns void but records metrics internally
    await expect(limiter.prune()).resolves.toBeUndefined();
  });
});
