import { describe, it, expect, beforeEach } from "vitest";
import type { RateLimitRepository } from "@/lib/rate-limiting/repository";
import { FakeClock } from "@/lib/rate-limiting/clock";

export function runRepositoryContractTests(
  label: string,
  factory: () => RateLimitRepository,
  options?: { supportsConcurrency?: boolean },
) {
  describe(`${label} — repository contract`, () => {
    let repo: RateLimitRepository;
    let clock: FakeClock;

    beforeEach(() => {
      repo = factory();
      clock = new FakeClock(1_000_000_000_000);
    });

    it("increment creates a new row and returns count 1", async () => {
      const result = await repo.increment("app:test:key1", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      expect(result.count).toBe(1);
    });

    it("increment increments an existing key", async () => {
      const now = BigInt(clock.now());
      const cutoff = BigInt(clock.now() - 60_000);
      await repo.increment("app:test:key2", now, cutoff);
      const result = await repo.increment("app:test:key2", BigInt(clock.now()), cutoff);
      expect(result.count).toBe(2);
    });

    it("increment resets count when window expired", async () => {
      await repo.increment("app:test:key3", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      clock.advance(61_000);
      const result = await repo.increment("app:test:key3", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      expect(result.count).toBe(1);
    });

    if (options?.supportsConcurrency !== false) {
      it("increment handles concurrent callers", async () => {
        const key = "app:test:concurrent";
        const results = await Promise.all([
          repo.increment(key, BigInt(clock.now()), BigInt(clock.now() - 60_000)),
          repo.increment(key, BigInt(clock.now()), BigInt(clock.now() - 60_000)),
          repo.increment(key, BigInt(clock.now()), BigInt(clock.now() - 60_000)),
        ]);
        const counts = results.map((r) => r.count).sort((a, b) => a - b);
        expect(counts).toEqual([1, 2, 3]);
      });
    }

    it("deleteById removes only the specified key", async () => {
      await repo.increment("app:test:a", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.increment("app:test:b", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.deleteById("app:test:a");
      const a = await repo.increment("app:test:a", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      const b = await repo.increment("app:test:b", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      expect(a.count).toBe(1);
      expect(b.count).toBe(2);
    });

    it("deleteAllAppKeys removes app: rows but preserves others", async () => {
      await repo.increment("app:test:x", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.increment("other:key", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.deleteAllAppKeys();
      const appKey = await repo.increment("app:test:x", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      const otherKey = await repo.increment("other:key", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      expect(appKey.count).toBe(1);
      expect(otherKey.count).toBe(2);
    });

    it("pruneAppKeys removes expired app: keys", async () => {
      await repo.increment("app:test:old", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      clock.advance(86_401_000);
      const result = await repo.pruneAppKeys(BigInt(clock.now() - 86_400_000));
      expect(result.rowsDeleted).toBe(1);
      const fresh = await repo.increment("app:test:old", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      expect(fresh.count).toBe(1);
    });

    it("pruneAppKeys removes expired anon: keys", async () => {
      await repo.increment("anon:test:old", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      clock.advance(86_401_000);
      const result = await repo.pruneAppKeys(BigInt(clock.now() - 86_400_000));
      expect(result.rowsDeleted).toBe(1);
      const fresh = await repo.increment("anon:test:old", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      expect(fresh.count).toBe(1);
    });

    it("pruneAppKeys preserves active app: and anon: keys", async () => {
      await repo.increment("app:test:active", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.increment("anon:test:active", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      const result = await repo.pruneAppKeys(BigInt(clock.now() - 86_400_000));
      expect(result.rowsDeleted).toBe(0);
    });
  });
}
