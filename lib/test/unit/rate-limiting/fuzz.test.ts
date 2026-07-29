import { describe, it, expect } from "vitest";
import { FakeRepository } from "@/lib/rate-limiting/repository.fake";
import { ipHash } from "@/lib/rate-limiting/ip-hash";

describe("Rate limiting fuzz", () => {
  describe("FakeRepository edge cases", () => {
    it("handles empty keys", async () => {
      const repo = new FakeRepository();
      const now = BigInt(Date.now());
      const cutoff = BigInt(Number(now) - 60_000);

      const result = await repo.increment("", now, cutoff);
      expect(result.count).toBe(1);

      const result2 = await repo.increment("", now, cutoff);
      expect(result2.count).toBe(2);
    });

    it("handles very long keys", async () => {
      const repo = new FakeRepository();
      const now = BigInt(Date.now());
      const cutoff = BigInt(Number(now) - 60_000);
      const longKey = "app:" + "a".repeat(1000);

      const result = await repo.increment(longKey, now, cutoff);
      expect(result.count).toBe(1);
    });

    it("handles timestamps at epoch boundaries", async () => {
      const repo = new FakeRepository();
      const epoch = BigInt(0);
      const cutoff = BigInt(-60_000);

      const result = await repo.increment("app:test:epoch", epoch, cutoff);
      expect(result.count).toBe(1);
    });

    it("handles timestamps at max safe integer", async () => {
      const repo = new FakeRepository();
      const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
      const cutoff = BigInt(Number.MAX_SAFE_INTEGER - 60_000);

      const result = await repo.increment("app:test:max", maxSafe, cutoff);
      expect(result.count).toBe(1);
    });

    it("handles negative cutoff (all keys expired)", async () => {
      const repo = new FakeRepository();
      const now = BigInt(1000);
      const cutoff = BigInt(2000); // cutoff > now

      await repo.increment("app:test:expired", now, cutoff);
      const result = await repo.increment("app:test:expired", now, cutoff);
      expect(result.count).toBe(1);
    });

    it("handles pruneAppKeys with empty store", async () => {
      const repo = new FakeRepository();
      const result = await repo.pruneAppKeys(BigInt(Date.now()));
      expect(result.rowsDeleted).toBe(0);
      expect(result.timedOut).toBe(false);
    });
  });

  describe("ipHash edge cases", () => {
    it("handles empty IP", () => {
      const hash = ipHash("", "test-salt", 16);
      expect(hash.length).toBe(16);
    });

    it("handles IPv6 addresses", () => {
      const hash = ipHash("::1", "test-salt", 16);
      expect(hash.length).toBe(16);
    });

    it("handles very short digest length", () => {
      const hash = ipHash("192.168.1.1", "test-salt", 8);
      expect(hash.length).toBe(8);
    });

    it("produces consistent hashes for same input", () => {
      const a = ipHash("10.0.0.1", "salt", 16);
      const b = ipHash("10.0.0.1", "salt", 16);
      expect(a).toBe(b);
    });

    it("produces different hashes for different salts", () => {
      const a = ipHash("10.0.0.1", "salt1", 16);
      const b = ipHash("10.0.0.1", "salt2", 16);
      expect(a).not.toBe(b);
    });
  });
});
