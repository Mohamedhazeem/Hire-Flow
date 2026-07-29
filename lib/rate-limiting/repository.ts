import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimitConfig } from "./config";

export interface PruneResult {
  rowsDeleted: number;
  batchesExecuted: number;
  durationMs: number;
  timedOut: boolean;
}

export interface RateLimitRepository {
  increment(key: string, now: bigint, cutoff: bigint): Promise<{ count: number }>;
  deleteById(key: string): Promise<void>;
  deleteAllAppKeys(): Promise<void>;
  pruneAppKeys(
    cutoff: bigint,
    options?: { batchSize?: number; budgetMs?: number },
  ): Promise<PruneResult>;
}

export class PrismaRateLimitRepository implements RateLimitRepository {
  async increment(key: string, now: bigint, cutoff: bigint): Promise<{ count: number }> {
    const [row] = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      INSERT INTO rate_limit (id, key, count, "lastRequest")
      VALUES (${key}, ${key}, 1, ${now})
      ON CONFLICT (id) DO UPDATE SET
        count = CASE
          WHEN rate_limit."lastRequest" < ${cutoff} THEN 1
          ELSE rate_limit.count + 1
        END,
        "lastRequest" = ${now}
      RETURNING count
    `);
    return { count: row ? Number(row.count) : 1 };
  }

  async deleteById(key: string): Promise<void> {
    await prisma.rateLimit.deleteMany({ where: { id: key } });
  }

  async deleteAllAppKeys(): Promise<void> {
    await prisma.rateLimit.deleteMany({ where: { id: { startsWith: "app:" } } });
  }

  async pruneAppKeys(
    cutoff: bigint,
    options?: { batchSize?: number; budgetMs?: number },
  ): Promise<PruneResult> {
    const start = Date.now();
    const batchSize = options?.batchSize ?? rateLimitConfig.cleanup.batchSize;
    const budgetMs = options?.budgetMs ?? rateLimitConfig.cleanup.budgetMs;
    let totalDeleted = 0;
    let batches = 0;

    while (true) {
      const elapsed = Date.now() - start;
      if (elapsed >= budgetMs) {
        return {
          rowsDeleted: totalDeleted,
          batchesExecuted: batches,
          durationMs: elapsed,
          timedOut: true,
        };
      }

      const result = await prisma.$executeRaw<number>(Prisma.sql`
        DELETE FROM rate_limit
        WHERE id IN (
          SELECT id FROM rate_limit
          WHERE (id LIKE 'app:%' OR id LIKE 'anon:%') AND "lastRequest" < ${cutoff}
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        )
      `);

      batches++;
      if (result === 0) break;
      totalDeleted += Number(result);
    }

    return {
      rowsDeleted: totalDeleted,
      batchesExecuted: batches,
      durationMs: Date.now() - start,
      timedOut: false,
    };
  }
}
