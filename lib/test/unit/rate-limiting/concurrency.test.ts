import { describe, it, expect } from "vitest";
import { FakeRepository } from "@/lib/rate-limiting/repository.fake";

describe("FakeRepository concurrency", () => {
  it("handles concurrent increments on the same key", async () => {
    const repo = new FakeRepository();
    const now = BigInt(Date.now());
    const cutoff = BigInt(Number(now) - 60_000);

    const results = await Promise.all(
      Array.from({ length: 50 }, () => repo.increment("app:test:concurrent-key", now, cutoff)),
    );

    expect(results.length).toBe(50);
    const counts = results.map((r) => r.count);
    expect(counts).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
  });

  it("handles interleaved increments on different keys", async () => {
    const repo = new FakeRepository();
    const now = BigInt(Date.now());
    const cutoff = BigInt(Number(now) - 60_000);
    const keys = ["a", "b", "c", "d", "e"];

    const results = await Promise.all(
      keys.flatMap((key) =>
        Array.from({ length: 10 }, () => repo.increment(`app:test:${key}`, now, cutoff)),
      ),
    );

    expect(results.length).toBe(50);
    const aCounts = results.filter((_, i) => Math.floor(i / 10) === 0);
    expect(aCounts.length).toBe(10);
  });
});
