import { TooManyRequestsError } from "@/lib/api/api-error";
import { rateLimitConfig } from "./config";
import { recordCleanupMetrics } from "./metrics";
import type { Clock, RateLimiter, RateLimitResult } from "./types";
import type { RateLimitRepository } from "./repository";

export class RateLimiterImpl implements RateLimiter {
  constructor(
    private repo: RateLimitRepository,
    private clock: Clock,
  ) {}

  async check(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    const now = this.clock.now();
    const { count } = await this.repo.increment(key, BigInt(now), BigInt(now - windowMs));
    const allowed = count <= max;
    const reset = Math.ceil((now + windowMs) / 1000);
    return {
      allowed,
      limit: max,
      remaining: Math.max(0, max - count),
      reset,
      retryAfter: Math.max(1, reset - Math.ceil(now / 1000)),
    };
  }

  async enforce(key: string, max: number, windowMs: number): Promise<void> {
    const result = await this.check(key, max, windowMs);
    if (!result.allowed)
      throw new TooManyRequestsError("Rate limit exceeded. Please try again later.");
  }

  async reset(key?: string): Promise<void> {
    if (key) await this.repo.deleteById(key);
    else await this.repo.deleteAllAppKeys();
  }

  async prune(): Promise<void> {
    const now = this.clock.now();
    const cutoff = BigInt(now - rateLimitConfig.cleanup.retentionMs);
    const result = await this.repo.pruneAppKeys(cutoff);
    recordCleanupMetrics(result);
  }
}
