export interface EndpointLimit {
  max: number;
  windowMs: number;
  failStrategy?: "open" | "closed";
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
}

export interface CleanupConfig {
  enabled: boolean;
  intervalMs: number;
  retentionMs: number;
  batchSize: number;
  budgetMs: number;
}

export interface FailStrategyConfig {
  default: "open" | "closed";
  statusCode: number;
}

export interface RateLimiter {
  check(key: string, max: number, windowMs: number): Promise<RateLimitResult>;
  enforce(key: string, max: number, windowMs: number): Promise<void>;
  reset(key?: string): Promise<void>;
  prune(): Promise<void>;
}

export interface Clock {
  now(): number;
}

export interface IPHasher {
  hash(ip: string): string;
}
