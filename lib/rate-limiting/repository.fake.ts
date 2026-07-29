import type { RateLimitRepository, PruneResult } from "./repository";

export class FakeRepository implements RateLimitRepository {
  private store = new Map<string, { count: number; lastRequest: bigint }>();

  async increment(key: string, now: bigint, cutoff: bigint): Promise<{ count: number }> {
    const existing = this.store.get(key);
    if (!existing || existing.lastRequest < cutoff) {
      this.store.set(key, { count: 1, lastRequest: now });
      return { count: 1 };
    }
    existing.count++;
    existing.lastRequest = now;
    return { count: existing.count };
  }

  async deleteById(key: string): Promise<void> {
    this.store.delete(key);
  }

  async deleteAllAppKeys(): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith("app:")) this.store.delete(key);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async pruneAppKeys(cutoff: bigint, _options?: { batchSize?: number; budgetMs?: number }): Promise<PruneResult> {
    const start = Date.now();
    let deleted = 0;
    for (const [key, row] of this.store.entries()) {
      if ((key.startsWith("app:") || key.startsWith("anon:")) && row.lastRequest < cutoff) {
        this.store.delete(key);
        deleted++;
      }
    }
    return { rowsDeleted: deleted, batchesExecuted: 1, durationMs: Date.now() - start, timedOut: false };
  }

  _clear(): void {
    this.store.clear();
  }
}
