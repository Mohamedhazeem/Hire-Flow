import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { PrismaRateLimitRepository } from "@/lib/rate-limiting/repository";
import { prisma } from "@/lib/prisma";

function isTestDBAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

describe("PrismaRateLimitRepository contract", () => {
  let repo: PrismaRateLimitRepository;

  beforeEach(() => {
    repo = new PrismaRateLimitRepository();
  });

  afterAll(async () => {
    await prisma.rateLimit.deleteMany({
      where: { id: { startsWith: "contract-test:" } },
    });
  });

  it.runIf(isTestDBAvailable())("increment creates a new row and returns count 1", async () => {
    const key = `contract-test:inc:1:${Date.now()}`;
    const now = BigInt(Date.now());
    const cutoff = now - BigInt(60_000);
    const result = await repo.increment(key, now, cutoff);
    expect(result.count).toBe(1);
    await repo.deleteById(key);
  });

  it.runIf(isTestDBAvailable())("increment increases count for existing key", async () => {
    const key = `contract-test:inc:2:${Date.now()}`;
    const now = BigInt(Date.now());
    const cutoff = now - BigInt(60_000);
    await repo.increment(key, now, cutoff);
    const result = await repo.increment(key, BigInt(Date.now()), cutoff);
    expect(result.count).toBe(2);
    await repo.deleteById(key);
  });

  it.runIf(isTestDBAvailable())("increment resets count when window expired", async () => {
    const key = `contract-test:inc:3:${Date.now()}`;
    const now = BigInt(Date.now());
    const cutoff = now - BigInt(60_000);
    await repo.increment(key, now, cutoff);
    const later = BigInt(Date.now() + 61_000);
    const result = await repo.increment(key, later, later - BigInt(60_000));
    expect(result.count).toBe(1);
    await repo.deleteById(key);
  });

  it.runIf(isTestDBAvailable())("increment handles concurrent callers", async () => {
    const key = `contract-test:inc:concurrent:${Date.now()}`;
    const now = BigInt(Date.now());
    const cutoff = now - BigInt(60_000);
    const results = await Promise.all([
      repo.increment(key, now, cutoff),
      repo.increment(key, now, cutoff),
      repo.increment(key, now, cutoff),
    ]);
    const counts = results.map((r) => r.count).sort((a, b) => a - b);
    expect(counts).toEqual([1, 2, 3]);
    await repo.deleteById(key);
  });

  it.runIf(isTestDBAvailable())("deleteById removes only the specified key", async () => {
    const keyA = `contract-test:del:a:${Date.now()}`;
    const keyB = `contract-test:del:b:${Date.now()}`;
    const now = BigInt(Date.now());
    const cutoff = now - BigInt(60_000);
    await repo.increment(keyA, now, cutoff);
    await repo.increment(keyB, now, cutoff);
    await repo.deleteById(keyA);
    const a = await repo.increment(keyA, BigInt(Date.now()), cutoff);
    const b = await repo.increment(keyB, BigInt(Date.now()), cutoff);
    expect(a.count).toBe(1);
    expect(b.count).toBe(2);
  });

  it.runIf(isTestDBAvailable())("deleteAllAppKeys removes app: rows but preserves others", async () => {
    const appKey = `app:contract-test:${Date.now()}`;
    const otherKey = `other:contract-test:${Date.now()}`;
    const now = BigInt(Date.now());
    const cutoff = now - BigInt(60_000);
    await repo.increment(appKey, now, cutoff);
    await repo.increment(otherKey, now, cutoff);
    await repo.deleteAllAppKeys();
    const appCheck = await repo.increment(appKey, BigInt(Date.now()), cutoff);
    const otherCheck = await repo.increment(otherKey, BigInt(Date.now()), cutoff);
    expect(appCheck.count).toBe(1);
    expect(otherCheck.count).toBe(2);
    await repo.deleteById(otherKey);
  });

  it.runIf(isTestDBAvailable())("pruneAppKeys removes expired app: and anon: keys", async () => {
    const appKey = `app:contract-test:prune:${Date.now()}`;
    const anonKey = `anon:contract-test:prune:${Date.now()}`;
    const now = BigInt(Date.now());
    const cutoff = now - BigInt(60_000);
    await repo.increment(appKey, now, cutoff);
    await repo.increment(anonKey, now, cutoff);
    const oldCutoff = BigInt(Date.now() + 86_401_000);
    const result = await repo.pruneAppKeys(oldCutoff);
    expect(result.rowsDeleted).toBeGreaterThanOrEqual(2);
    const appFresh = await repo.increment(appKey, BigInt(Date.now()), cutoff);
    const anonFresh = await repo.increment(anonKey, BigInt(Date.now()), cutoff);
    expect(appFresh.count).toBe(1);
    expect(anonFresh.count).toBe(1);
  });

  it.runIf(isTestDBAvailable())("pruneAppKeys timeout returns correct signal", async () => {
    const result = await repo.pruneAppKeys(BigInt(Date.now()), { batchSize: 100, budgetMs: 0 });
    expect(result.timedOut).toBe(true);
  });
});
