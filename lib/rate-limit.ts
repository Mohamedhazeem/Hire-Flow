import { TooManyRequestsError } from "./api/api-error";

/**
 * Simple in-memory sliding-window rate limiter.
 * Not shared across server instances — suitable for single-process deployments.
 * For multi-instance, replace with a Redis-backed implementation.
 */

const stores = new Map<string, { timestamps: number[] }>();

type RateLimitConfig = {
  /** Max number of attempts allowed within the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
};

const DEFAULT_CONFIG: RateLimitConfig = { max: 10, windowMs: 60000 }; // 10 per minute

export function checkRateLimit(key: string, config: Partial<RateLimitConfig> = {}): void {
  const { max, windowMs } = { ...DEFAULT_CONFIG, ...config };
  let store = stores.get(key);
  if (!store) {
    store = { timestamps: [] };
    stores.set(key, store);
  }

  const now = Date.now();
  const cutoff = now - windowMs;

  // Prune expired timestamps
  store.timestamps = store.timestamps.filter((t) => t > cutoff);

  if (store.timestamps.length >= max) {
    throw new TooManyRequestsError(`Too many requests. Please try again later.`);
  }

  store.timestamps.push(now);
}

/**
 * Prune stale entries from the in-memory store to prevent unbounded growth.
 */
export function pruneRateLimitStores(): void {
  const now = Date.now();
  for (const [key, store] of stores) {
    // Remove entire key if no recent activity (last timestamp > 1 hour old)
    const recent = store.timestamps.filter((t) => t > now - 3600000);
    if (recent.length === 0) {
      stores.delete(key);
    }
  }
}

// Periodic cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(pruneRateLimitStores, 600000);
}
