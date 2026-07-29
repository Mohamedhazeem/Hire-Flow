# App-Wide Rate Limiting — Unified, Role-Aware, DB-Backed (Improved)

## Current State (Before)

| Component                                                                | Status                                                                                         |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Better Auth `rateLimit` config (auth endpoints)                          | **Active** — uses Prisma `RateLimit` model with UUID `id` values                               |
| `lib/rate-limit.ts` (in-memory sliding window)                           | **Active (partial)** — wired into `jobs/[id]/view` (100/min) and `jobs/[id]/apply` (10/min)    |
| `lib/repositories/rate-limit-repository.ts` (DB message count)           | **Active** — wired into `message-service.ts` (threshold 200/hr, error message says 20 — bug)   |
| `app/features/recruiter/libs/rate-limit-message.ts` (DB message limiter) | **Dead code** — never imported in production (only tests)                                      |
| AI enhance quota (`ResumeEnhancementQuota` model)                        | **Active** — custom per-user daily 5/day with atomic `$queryRawUnsafe` UPDATE                  |
| `proxy.ts`                                                               | **No rate limiting** — only auth/role redirects                                                |
| OpenTelemetry                                                            | **Not configured** — no metrics, no tracing                                                    |
| Config validation                                                        | **Dev-only, sparse** — runs only in `NODE_ENV !== "production"`, validates only numeric bounds |
| Cleanup                                                                  | **Massive DELETE** — single `deleteMany` with potential to lock tables                         |
| Failure mode                                                             | **Hardcoded fail-open** — no way to configure per-endpoint                                     |

---

## Target Architecture

```
lib/rate-limiting/
  types.ts              # Shared types & interfaces
  config.ts             # Immutable config source + comprehensive validateConfig()
  clock.ts              # Clock interface + SystemClock + FakeClock
  repository.ts         # RateLimitRepository interface + PrismaRateLimitRepository (batched cleanup)
  rate-limiter.ts       # RateLimiter interface + RateLimiterImpl (single-clock-capture)
  middleware.ts         # createWithRateLimit(rateLimiter: RateLimiter) factory
  di.ts                 # Production wiring — exports pre-wired `withRateLimit` and `rateLimiter`
  request-context.ts    # AsyncLocalStorage session cache
  ip-hash.ts            # Deterministic IP hashing
  metrics.ts            # Real OpenTelemetry counters, histograms, gauges, spans
  cleanup.ts            # Scheduled batched cleanup orchestrator
  telemetry.ts          # RequestId propagation, trace context helpers
lib/test/unit/rate-limiting/
  contract/
    repository-contract.ts  # Shared behavioral test suite for all RateLimitRepository implementations
  repository.fake.ts        # FakeRepository (in-memory, used by RateLimiterImpl tests + contract tests)
  config.test.ts
  clock.test.ts
  rate-limiter.test.ts
  middleware.test.ts
  ip-hash.test.ts
  metrics.test.ts
  cleanup.test.ts
  repository.prisma.test.ts # PrismaRateLimitRepository contract tests (real DB)
  repository.fake.test.ts   # FakeRepository contract tests (in-memory)
  concurrency.test.ts
  fuzz.test.ts
  chaos.test.ts
  benchmark.test.ts
docs/architecture/rate-limiting.md  # Architecture documentation
```

### Dependency Hierarchy (Unchanged)

```
PrismaRateLimitRepository & SystemClock
        │                    │
        ▼                    ▼
          RateLimiterImpl  ←  pure business logic
               │
               ▼
          createWithRateLimit  ←  depends only on RateLimiter interface
          di.ts                ←  wires everything at boot
```

---

## Component Specifications

### Storage: Prisma `RateLimit` Model (reuse, no schema changes)

Unchanged from consolidated plan. ID = `"app:{endpoint}:{actor}"`, primary key index (O(log n)). Better Auth UUIDs with `app:` prefix never collide.

### `types.ts` — Shared Interfaces

Additions from consolidated:

```ts
export interface EndpointLimit {
  max: number;
  windowMs: number;
  failStrategy?: "open" | "closed"; // NEW: per-endpoint override (optional)
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
  batchSize: number; // NEW: rows per batch
  budgetMs: number; // NEW: time budget per cycle
}

export interface FailStrategyConfig {
  default: "open" | "closed"; // NEW: global default
  statusCode: number; // NEW: HTTP status when closed (default 503)
}

export type RateLimitEndpoint = keyof typeof import("./config").rateLimitConfig.endpoints;
```

### `config.ts` — Immutable, Comprehensively Validated

```ts
export const rateLimitConfig = {
  enabled: true,
  shadowMode: false,
  strategy: "prisma" as const,

  // NEW: Configurable failure strategy
  failStrategy: {
    default: "open" as "open" | "closed",
    statusCode: 503,
  },

  proxy: {
    trusted: false,
    trustedHeader: "x-real-ip" as "x-real-ip" | "x-forwarded-for" | "cf-connecting-ip",
  },

  ipHashing: {
    enabled: true,
    saltEnvVar: "RATE_LIMIT_IP_SALT",
    digestLength: 16,
  },

  // NEW: Expanded cleanup with batching + time budget
  cleanup: {
    enabled: true,
    intervalMs: 86_400_000,
    retentionMs: 86_400_000,
    batchSize: 5_000,
    budgetMs: 30_000,
  } satisfies CleanupConfig,

  default: { max: 20, windowMs: 60_000, failStrategy: undefined } as EndpointLimit,

  roles: {
    anonymous: { multiplier: 0.3 },
    user: { multiplier: 1 },
    recruiter: { multiplier: 2 },
    admin: { multiplier: 5 },
    super_admin: { multiplier: 10 },
  },

  endpoints: {
    "jobs:view": { max: 100, windowMs: 60_000 },
    "jobs:apply": { max: 10, windowMs: 60_000, failStrategy: "open" }, // NEW: per-endpoint override
    "messages:send": { max: 200, windowMs: 3_600_000 },
    "resumes:ai-enhance": { max: 5, windowMs: 86_400_000 },
    "messages:list": { max: 60, windowMs: 60_000 },
    "notifications:list": { max: 60, windowMs: 60_000 },
    "profile:update": { max: 10, windowMs: 60_000 },
    "resumes:upload": { max: 10, windowMs: 60_000 },
    "applications:list": { max: 30, windowMs: 60_000 },
    "bookmarks:list": { max: 30, windowMs: 60_000 },
    "bookmarks:toggle": { max: 20, windowMs: 60_000 },
  } satisfies Record<string, EndpointLimit>,
};

export function validateConfig(): void {
  // ── General shape validations (unchanged from consolidated but always runs) ──
  const {
    endpoints,
    roles,
    default: def,
    strategy,
    proxy,
    ipHashing,
    cleanup,
    failStrategy,
    shadowMode,
    enabled,
  } = rateLimitConfig;

  // ── Type assertions (fail fast) ──
  if (typeof enabled !== "boolean") throw new Error("enabled must be a boolean");
  if (typeof shadowMode !== "boolean") throw new Error("shadowMode must be a boolean");

  const VALID_STRATEGIES = new Set(["prisma", "redis", "memory"]);
  if (!VALID_STRATEGIES.has(strategy)) {
    throw new Error(`strategy "${strategy}" must be one of: ${[...VALID_STRATEGIES].join(", ")}`);
  }

  if (typeof proxy.trusted !== "boolean") throw new Error("proxy.trusted must be a boolean");
  const VALID_HEADERS = new Set(["x-real-ip", "x-forwarded-for", "cf-connecting-ip"]);
  if (!VALID_HEADERS.has(proxy.trustedHeader)) {
    throw new Error(
      `trustedHeader "${proxy.trustedHeader}" must be one of: ${[...VALID_HEADERS].join(", ")}`,
    );
  }

  // ── ipHashing ──
  if (typeof ipHashing.enabled !== "boolean")
    throw new Error("ipHashing.enabled must be a boolean");
  if (
    ipHashing.digestLength < 8 ||
    ipHashing.digestLength > 64 ||
    !Number.isInteger(ipHashing.digestLength)
  ) {
    throw new Error(
      `ipHashing.digestLength must be an integer between 8 and 64, got ${ipHashing.digestLength}`,
    );
  }
  const salt = process.env[ipHashing.saltEnvVar];
  if (ipHashing.enabled && process.env.NODE_ENV === "production" && !salt) {
    throw new Error(`ipHashing requires ${ipHashing.saltEnvVar} env var in production`);
  }

  // ── Cleanup ──
  if (typeof cleanup.enabled !== "boolean") throw new Error("cleanup.enabled must be a boolean");
  for (const key of ["intervalMs", "retentionMs", "batchSize", "budgetMs"] as const) {
    if (!Number.isFinite(cleanup[key]) || cleanup[key] <= 0) {
      throw new Error(`cleanup.${key} must be > 0, got ${cleanup[key]}`);
    }
  }
  if (cleanup.batchSize < 100 || cleanup.batchSize > 100_000) {
    throw new Error(`cleanup.batchSize must be between 100 and 100,000, got ${cleanup.batchSize}`);
  }

  // ── Failure strategy ──
  if (!["open", "closed"].includes(failStrategy.default)) {
    throw new Error('failStrategy.default must be "open" or "closed"');
  }
  if (
    !Number.isInteger(failStrategy.statusCode) ||
    failStrategy.statusCode < 400 ||
    failStrategy.statusCode > 599
  ) {
    throw new Error("failStrategy.statusCode must be an integer between 400 and 599");
  }

  // ── Default limit ──
  if (def.max <= 0 || def.windowMs <= 0) throw new Error("default limit or windowMs must be > 0");
  if (def.failStrategy && !["open", "closed"].includes(def.failStrategy)) {
    throw new Error('default.failStrategy must be "open", "closed", or undefined');
  }

  // ── Roles ──
  for (const [role, cfg] of Object.entries(roles)) {
    if (cfg.multiplier <= 0) throw new Error(`role "${role}" multiplier must be > 0`);
    if (!Number.isFinite(cfg.multiplier))
      throw new Error(`role "${role}" multiplier must be finite`);
  }

  // ── Endpoints ──
  for (const [key, ep] of Object.entries(endpoints)) {
    if (ep.max <= 0) throw new Error(`endpoint "${key}" max must be > 0`);
    if (ep.windowMs <= 0) throw new Error(`endpoint "${key}" windowMs must be > 0`);
    if (ep.failStrategy && !["open", "closed"].includes(ep.failStrategy)) {
      throw new Error(`endpoint "${key}" failStrategy must be "open", "closed", or undefined`);
    }
    const minMult = Math.min(...Object.values(roles).map((r) => r.multiplier));
    if (Math.round(ep.max * minMult) < 1) {
      throw new Error(`endpoint "${key}" produces effectiveMax < 1 with multiplier ${minMult}`);
    }
  }

  // ── Invalid combinations ──
  if (shadowMode && strategy === "memory") {
    throw new Error("shadowMode is not supported with memory strategy");
  }
  if (
    proxy.trusted &&
    process.env.NODE_ENV === "production" &&
    !process.env.RATE_LIMIT_TRUSTED_PROXY
  ) {
    console.warn(
      "proxy.trusted is true but RATE_LIMIT_TRUSTED_PROXY env var is not set. Ensure you are behind a trusted proxy.",
    );
  }
}

// NEW: Freeze config after validation to prevent accidental mutation during request handling
export function freezeConfig(): void {
  Object.freeze(rateLimitConfig);
  Object.freeze(rateLimitConfig.roles);
  Object.freeze(rateLimitConfig.endpoints);
  Object.freeze(rateLimitConfig.proxy);
  Object.freeze(rateLimitConfig.ipHashing);
  Object.freeze(rateLimitConfig.cleanup);
  Object.freeze(rateLimitConfig.failStrategy);
  // Note: Object.freeze is shallow — RoleConfig and EndpointLimit objects inside
  // frozen Maps are frozen individually only if we recursively freeze them.
  // For safety, also freeze each:
  for (const ep of Object.values(rateLimitConfig.endpoints)) Object.freeze(ep);
  for (const role of Object.values(rateLimitConfig.roles)) Object.freeze(role);
}
```

### `clock.ts` — Time Abstraction

Unchanged from consolidated plan.

### `repository.ts` — Pure Data Access with Batched Cleanup

**IMPORTANT:** The `RateLimitRepository` interface is unchanged for the request-path methods. Only `pruneAppKeys` signature changes to support batching.

```ts
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

  // NEW: Batched pruning with time budget
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
          WHERE id LIKE 'app:%' AND "lastRequest" < ${cutoff}
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        )
      `);

      batches++;
      if (result === 0) break; // No more rows to delete
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
```

**Why `FOR UPDATE SKIP LOCKED` in the subquery:** Multiple concurrent cleanup instances (e.g., multiple pods) won't fight over the same rows. Each pod claims its own batch, the others skip locked rows and pick up the next batch. This is safe for the `DELETE` use case because we're deleting expired rows — we don't care which pod deletes which row as long as they all eventually get deleted.

**Why batching is in the repository, not the business layer:** Batching is a persistence implementation detail (which rows to delete, which lock strategy to use). It has no business semantics. The `RateLimiter` interface's `prune()` method is unchanged — it still calls `repo.pruneAppKeys(cutoff)`.

### `rate-limiter.ts` — Single Clock Capture, Unchanged Interface

**Fix #7: Eliminate duplicate time reads:**

```ts
export class RateLimiterImpl implements RateLimiter {
  constructor(
    private repo: RateLimitRepository,
    private clock: Clock,
  ) {}

  async check(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    const now = this.clock.now(); // captured once
    const { count } = await this.repo.increment(key, BigInt(now), BigInt(now - windowMs));
    const allowed = count <= max;
    const reset = Math.ceil((now + windowMs) / 1000); // uses captured `now`
    return {
      allowed,
      limit: max,
      remaining: Math.max(0, max - count),
      reset,
      retryAfter: Math.max(1, reset - Math.ceil(now / 1000)), // uses same `now`
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
    // Record cleanup metrics
    recordCleanupMetrics(result);
  }
}
```

### `middleware.ts` — Configurable Failure Strategy

**Fix #4: Replace hardcoded fail-open with configurable strategy:**

```ts
export function createWithRateLimit(rateLimiter: RateLimiter) {
  return function withRateLimit(
    handler: SimpleHandler | ParamHandler,
    endpointKey: RateLimitEndpoint,
  ) {
    return async (request: NextRequest, context?: RouteContext) => {
      // ── Early exit if disabled (unchanged)

      // ── Session, IP, actor, key building (unchanged)

      // ── Determine failure strategy for this endpoint
      const endpointCfg = rateLimitConfig.endpoints[endpointKey] ?? rateLimitConfig.default;
      const failStrategy = endpointCfg.failStrategy ?? rateLimitConfig.failStrategy.default;

      // ── 5. Check rate limit via injected RateLimiter
      const start = performance.now();
      let result: RateLimitResult;
      try {
        result = await rateLimiter.check(dbKey, effectiveMax, cfg.windowMs);
      } catch (err) {
        // DB failure — apply configured failure strategy
        const durationMs = Math.round(performance.now() - start);
        recordCheckDuration(durationMs, endpointKey);
        countRateLimitDecision({ endpoint: endpointKey, role, decision: "db_failure" });
        logger.rateLimit.error("rate_limit_db_error", {
          endpointKey,
          error: String(err),
          durationMs,
          failStrategy,
        });

        if (failStrategy === "closed") {
          return buildServiceUnavailableResponse(rateLimitConfig.failStrategy.statusCode);
        }
        // failStrategy === 'open': allow request through
        return runWithSession(session, () =>
          context
            ? (handler as ParamHandler)(request, context)
            : (handler as SimpleHandler)(request),
        );
      }

      // ── Decision, logging, headers (unchanged)
      // ...
    };
  };
}

function buildServiceUnavailableResponse(statusCode: number): NextResponse {
  return NextResponse.json(
    { success: false, error: "Service temporarily unavailable. Please try again." },
    { status: statusCode },
  );
}
```

### `metrics.ts` — Real OpenTelemetry (not stubs)

**Fix #5:** Replace no-op stubs with real OpenTelemetry instrumentation. The `@opentelemetry/api` package must be installed (`npm install @opentelemetry/api`).

```ts
import { metrics, trace, SpanStatusCode } from "@opentelemetry/api";
import { rateLimitConfig } from "./config";

const meter = metrics.getMeter("hire-flow.rate-limiting");
const tracer = trace.getTracer("hire-flow.rate-limiting");

// ── Counters ──
const decisionCounter = meter.createCounter("rate_limit.decisions", {
  description: "Count of rate-limit decision outcomes",
});
const dbFailureCounter = meter.createCounter("rate_limit.db_failures", {
  description: "Count of DB failures during rate-limit check",
});

// ── Histograms ──
const checkDurationHistogram = meter.createHistogram("rate_limit.check_duration_ms", {
  description: "Duration of RateLimiter.check() calls",
  unit: "ms",
});
const dbLatencyHistogram = meter.createHistogram("rate_limit.db_latency_ms", {
  description: "Duration of repository.increment() calls",
  unit: "ms",
});
const cleanupDurationHistogram = meter.createHistogram("rate_limit.cleanup_duration_ms", {
  description: "Duration of cleanup cycles",
  unit: "ms",
});

// ── Gauges ──
const activeKeysGauge = meter.createGauge("rate_limit.active_app_keys", {
  description: "Number of active app: rate limit rows after cleanup",
});

// ── Public API ──

export function countRateLimitDecision(labels: {
  endpoint: string;
  role: string;
  decision: string;
}): void {
  decisionCounter.add(1, labels);
}

export function recordCheckDuration(durationMs: number, endpoint: string): void {
  checkDurationHistogram.record(durationMs, { endpoint, strategy: rateLimitConfig.strategy });
}

export function recordDbLatency(durationMs: number): void {
  dbLatencyHistogram.record(durationMs);
}

export function recordCleanupMetrics(result: {
  rowsDeleted: number;
  durationMs: number;
  batchesExecuted: number;
  timedOut: boolean;
}): void {
  cleanupDurationHistogram.record(result.durationMs);
  // row-count histogram or counter
  meter.createCounter("rate_limit.cleanup_rows").add(result.rowsDeleted);
  meter.createCounter("rate_limit.cleanup_batches").add(result.batchesExecuted);
  if (result.timedOut) {
    meter.createCounter("rate_limit.cleanup_timeouts").add(1);
  }
}

export function setActiveKeyCount(count: number): void {
  activeKeysGauge.record(count);
}

// ── Span helpers ──

export function startCheckSpan(key: string, max: number) {
  return tracer.startSpan("rate_limit.check", {
    attributes: { key, max },
  });
}

export function endCheckSpan(
  span: ReturnType<typeof startCheckSpan>,
  allowed: boolean,
  durationMs: number,
): void {
  span.setAttribute("allowed", allowed);
  span.setAttribute("duration_ms", durationMs);
  span.end();
}

export function recordSpanError(span: ReturnType<typeof startCheckSpan>, error: Error): void {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  span.end();
}
```

### `telemetry.ts` — RequestId and Trace Context (NEW)

```ts
import { AsyncLocalStorage } from "node:async_hooks";
import { trace, context } from "@opentelemetry/api";

export interface TraceContext {
  requestId: string;
  traceId?: string;
  spanId?: string;
}

const traceStorage = new AsyncLocalStorage<TraceContext>();

export function getTraceContext(): TraceContext | null {
  return traceStorage.getStore() ?? null;
}

export function runWithTraceContext<T>(ctx: TraceContext, fn: () => Promise<T>): Promise<T> {
  return traceStorage.run(ctx, fn);
}

/** Generate a short (12-char) request ID from crypto.randomUUID().substring(0,12) */
export function generateRequestId(): string {
  return crypto.randomUUID().substring(0, 12);
}

/** Enrich a structured log entry with trace context */
export function enrichLog(base: Record<string, unknown>): Record<string, unknown> {
  const ctx = getTraceContext();
  if (ctx) {
    base.requestId = ctx.requestId;
    // Active OpenTelemetry span context is automatically picked up by logger
  }
  return base;
}
```

### `cleanup.ts` — Batched Cleanup Orchestrator

```ts
import { rateLimiter } from "./di";
import { rateLimitConfig } from "./config";
import { recordCleanupMetrics, setActiveKeyCount } from "./metrics";
import { prisma } from "@/lib/prisma";

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startCleanup(): void {
  if (!rateLimitConfig.cleanup.enabled) return;
  if (cleanupTimer) return;

  cleanupTimer = setInterval(async () => {
    try {
      // prune() calls RateLimiterImpl.prune() → repo.pruneAppKeys(cutoff, options)
      // which executes batched DELETE with SKIP LOCKED
      await rateLimiter.prune();

      // Export active-key gauge after cleanup
      const count = await prisma.rateLimit.count({
        where: { id: { startsWith: "app:" } },
      });
      setActiveKeyCount(count);
    } catch (err) {
      console.error("[rate-limit] cleanup failed:", err);
    }
  }, rateLimitConfig.cleanup.intervalMs);

  // Unref so the timer doesn't keep the process alive
  cleanupTimer.unref();
}

export function stopCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
```

### `request-context.ts` — AsyncLocalStorage Session Cache

Unchanged from consolidated plan.

### `ip-hash.ts` — Deterministic IP Hashing

Unchanged from consolidated plan.

### `di.ts` — Single Wiring Point

Unchanged from consolidated plan. The factory wiring is identical — config validation and freezing happen at module import time.

### `repository.fake.ts` — In-Memory FakeRepository for Tests (NEW)

```ts
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

  async pruneAppKeys(
    cutoff: bigint,
    options?: { batchSize?: number; budgetMs?: number },
  ): Promise<PruneResult> {
    const start = Date.now();
    let deleted = 0;
    for (const [key, row] of this.store.entries()) {
      if (key.startsWith("app:") && row.lastRequest < cutoff) {
        this.store.delete(key);
        deleted++;
      }
    }
    return {
      rowsDeleted: deleted,
      batchesExecuted: 1,
      durationMs: Date.now() - start,
      timedOut: false,
    };
  }

  // Test helper
  _clear(): void {
    this.store.clear();
  }
}
```

---

## Repository Contract Tests (Shared Behavioral Suite)

**Fix #2:** A single shared test suite that verifies any `RateLimitRepository` implementation satisfies the full contract.

```ts
// lib/test/unit/rate-limiting/contract/repository-contract.ts
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

    // ── increment ──
    it("increment creates a new row and returns count 1", async () => {
      const result = await repo.increment(
        "app:test:key1",
        BigInt(clock.now()),
        BigInt(clock.now() - 60_000),
      );
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
      const result = await repo.increment(
        "app:test:key3",
        BigInt(clock.now()),
        BigInt(clock.now() - 60_000),
      );
      expect(result.count).toBe(1);
    });

    it(
      "increment handles concurrent callers",
      options?.supportsConcurrency !== false &&
        (async () => {
          const key = "app:test:concurrent";
          const results = await Promise.all([
            repo.increment(key, BigInt(clock.now()), BigInt(clock.now() - 60_000)),
            repo.increment(key, BigInt(clock.now()), BigInt(clock.now() - 60_000)),
            repo.increment(key, BigInt(clock.now()), BigInt(clock.now() - 60_000)),
          ]);
          const counts = results.map((r) => r.count).sort((a, b) => a - b);
          expect(counts).toEqual([1, 2, 3]);
        })(),
    );

    // ── deleteById ──
    it("deleteById removes only the specified key", async () => {
      await repo.increment("app:test:a", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.increment("app:test:b", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.deleteById("app:test:a");
      const a = await repo.increment(
        "app:test:a",
        BigInt(clock.now()),
        BigInt(clock.now() - 60_000),
      );
      const b = await repo.increment(
        "app:test:b",
        BigInt(clock.now()),
        BigInt(clock.now() - 60_000),
      );
      expect(a.count).toBe(1); // deleted → fresh start
      expect(b.count).toBe(2); // not deleted, incremented
    });

    // ── deleteAllAppKeys ──
    it("deleteAllAppKeys removes app: rows but preserves others", async () => {
      await repo.increment("app:test:x", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.increment("other:key", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      await repo.deleteAllAppKeys();
      const appKey = await repo.increment(
        "app:test:x",
        BigInt(clock.now()),
        BigInt(clock.now() - 60_000),
      );
      const otherKey = await repo.increment(
        "other:key",
        BigInt(clock.now()),
        BigInt(clock.now() - 60_000),
      );
      expect(appKey.count).toBe(1); // deleted → fresh start
      expect(otherKey.count).toBe(2); // not deleted, incremented
    });

    // ── pruneAppKeys ──
    it("pruneAppKeys removes expired keys", async () => {
      await repo.increment("app:test:old", BigInt(clock.now()), BigInt(clock.now() - 60_000));
      clock.advance(86_401_000); // Past retention
      const result = await repo.pruneAppKeys(BigInt(clock.now() - 86_400_000));
      expect(result.rowsDeleted).toBe(1);
      // Re-creating after prune should return count 1
      const fresh = await repo.increment(
        "app:test:old",
        BigInt(clock.now()),
        BigInt(clock.now() - 60_000),
      );
      expect(fresh.count).toBe(1);
    });
  });
}
```

**Usage in actual test files:**

```ts
// repository.prisma.test.ts — runs against real DB
import { runRepositoryContractTests } from "./contract/repository-contract";
import { PrismaRateLimitRepository } from "@/lib/rate-limiting/repository";
import { resetDb } from "@/lib/test";

beforeEach(resetDb);
runRepositoryContractTests("PrismaRateLimitRepository", () => new PrismaRateLimitRepository());
```

```ts
// repository.fake.test.ts — runs against in-memory
import { runRepositoryContractTests } from "./contract/repository-contract";
import { FakeRepository } from "./repository.fake";

runRepositoryContractTests("FakeRepository", () => new FakeRepository());
```

---

## Benchmark Regression Support

**Fix #6:** Expand `BenchmarkResult` and baseline comparison to include richer metrics.

```ts
// lib/test/perf.ts
export interface BenchmarkResult {
  suite: string;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  rps: number; // NEW: requests per second
  allocations: number; // NEW: heap allocations (if available)
  dbQueryTimeMs: number; // NEW: DB query time (if available)
  sampleCount: number;
}
```

**Baseline comparison enhancement** (in `scripts/compare-benchmark.ts`):

```ts
interface SuiteThreshold {
  meanMs: number | null;
  budgetMs: number;
  maxAllocations?: number; // NEW: allocation budget
  minRps?: number; // NEW: minimum throughput
  regressionThreshold: number; // NEW: per-suite regression % (default 1.2)
}
```

**CI threshold configurable per-suite** in `benchmark/baseline.json`:

```json
{
  "updatedAt": "2026-07-29T00:00:00.000Z",
  "suites": {
    "rate-limiting-single-key": {
      "meanMs": null,
      "budgetMs": 50,
      "maxAllocations": 10000,
      "minRps": 1000,
      "regressionThreshold": 1.2
    }
  }
}
```

---

## Implementation Steps

### Step 1: Create `lib/rate-limiting/types.ts`

Pure types — add `CleanupConfig`, `FailStrategyConfig`, `PruneResult`. `EndpointLimit` gains optional `failStrategy`.

### Step 2: Create `lib/rate-limiting/config.ts`

Config with `failStrategy`, expanded `cleanup` (batchSize, budgetMs). `validateConfig()` runs unconditionally (both dev and production). `freezeConfig()` called after validation. Exported as both `validateConfig` + `freezeConfig`.

### Step 3: Create `lib/rate-limiting/clock.ts`

Unchanged.

### Step 4: Create `lib/rate-limiting/repository.ts`

`RateLimitRepository` interface — `pruneAppKeys` now returns `PruneResult` and accepts optional `{ batchSize, budgetMs }`. `PrismaRateLimitRepository` — `increment` with `Prisma.sql`, `pruneAppKeys` with batched `DELETE ... LIMIT ... FOR UPDATE SKIP LOCKED` loop with time budget.

### Step 5: Create `lib/rate-limiting/rate-limiter.ts`

`RateLimiter` interface unchanged. `RateLimiterImpl.check()` captures `this.clock.now()` once, uses it for all derived values (reset, retryAfter, cutoff). `prune()` records cleanup metrics.

### Step 6: Create `lib/rate-limiting/middleware.ts`

`createWithRateLimit(rateLimiter: RateLimiter)` — reads `failStrategy` from endpoint config (with global default). On DB error: if `closed` → 503, if `open` → handler proceeds. Includes `buildServiceUnavailableResponse`.

### Step 7: Create `lib/rate-limiting/di.ts`

Unchanged wiring. Imports `validateConfig` + `freezeConfig` and calls them at module top level.

### Step 8: Create `lib/rate-limiting/metrics.ts`

Real OpenTelemetry counters, histograms, gauges. Uses `@opentelemetry/api`. Includes `startCheckSpan`, `endCheckSpan`, `recordSpanError`. To install: `npm install @opentelemetry/api`.

### Step 9: Create `lib/rate-limiting/telemetry.ts`

`TraceContext` interface, `traceStorage` AsyncLocalStorage, `generateRequestId()`, `enrichLog()`. Used by middleware to wrap the handler run with trace context.

### Step 10: Create `lib/rate-limiting/request-context.ts`

Unchanged.

### Step 11: Modify `require-role.ts`

Unchanged cache check logic.

### Step 12: Create `lib/rate-limiting/ip-hash.ts`

Unchanged.

### Step 13: Create `lib/rate-limiting/cleanup.ts`

`startCleanup()` / `stopCleanup()` — `setInterval` with `unref()`. Calls `rateLimiter.prune()` then exports active key gauge.

### Step 14: Wire existing routes (same as consolidated plan)

### Step 15: Wire unprotected routes (same as consolidated plan)

### Step 16: Write tests

#### 16.1 — Unit Tests

| File                      | What it covers                                                                                                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `config.test.ts`          | `validateConfig()` passes valid config; throws on 20+ conditions (type errors, bounds, invalid combos, missing env vars). `freezeConfig()` prevents mutation.                                                                              |
| `clock.test.ts`           | `SystemClock.now()` returns `Date.now()`. `FakeClock` advances correctly.                                                                                                                                                                  |
| `repository.fake.ts`      | `FakeRepository` implements all interface methods.                                                                                                                                                                                         |
| `repository.fake.test.ts` | Runs shared `runRepositoryContractTests` against `FakeRepository`.                                                                                                                                                                         |
| `rate-limiter.test.ts`    | `check()` with `FakeClock` + `FakeRepository`. Single clock capture verified (same timestamp used in all derived fields). `enforce()` throws on block. Window expiry via `clock.advance()`.                                                |
| `middleware.test.ts`      | Mock `RateLimiter`. Passthrough when `enabled: false`. Shadow mode. Normal mode. Configurable fail strategy — `failStrategy: 'open'` on DB error → handler called; `failStrategy: 'closed'` → 503. Per-endpoint override of fail strategy. |
| `ip-hash.test.ts`         | Unchanged.                                                                                                                                                                                                                                 |
| `metrics.test.ts`         | Real OTel counters increment correctly. Spans start/end properly.                                                                                                                                                                          |
| `telemetry.test.ts`       | `generateRequestId()` returns 12-char string. `enrichLog()` adds trace context when inside `runWithTraceContext`.                                                                                                                          |
| `cleanup.test.ts`         | Batched pruning with time budget — stops when budget exhausted. Successful completion deletes all expired keys.                                                                                                                            |
| `request-context.test.ts` | Unchanged.                                                                                                                                                                                                                                 |

#### 16.2 — Integration Tests (real DB)

| File                        | What it covers                                                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository.prisma.test.ts` | Runs shared `runRepositoryContractTests` with `PrismaRateLimitRepository`. Also tests: batched pruning with `batchSize=2` (verifies loop terminates), time budget (budgetMs=0 → timedOut immediately), `FOR UPDATE SKIP LOCKED` doesn't deadlock. |
| `concurrency.test.ts`       | Same as consolidated plan.                                                                                                                                                                                                                        |
| `fuzz.test.ts`              | Same as consolidated plan.                                                                                                                                                                                                                        |
| `chaos.test.ts`             | Same as consolidated plan, plus: failStrategy 'closed' during DB outage returns 503.                                                                                                                                                              |
| `benchmark.test.ts`         | Extended metrics: allocations, throughput, DB query time.                                                                                                                                                                                         |

#### 16.3 — Contract Tests (shared suite)

| File                              | What it covers                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `contract/repository-contract.ts` | Shared `runRepositoryContractTests()` — tests increment (new, existing, expired, concurrency), deleteById, deleteAllAppKeys, pruneAppKeys. |
| `repository.fake.test.ts`         | Invokes contract suite against `FakeRepository`.                                                                                           |
| `repository.prisma.test.ts`       | Invokes contract suite against `PrismaRateLimitRepository` (real DB).                                                                      |

#### 16.4 — E2E (same as consolidated plan)

### Step 17: Remove dead code (same as consolidated plan)

### Step 18: Refactor `analytics-queries.ts` (separate concern)

### Step 19: Keep Better Auth's built-in rate limiting

### Step 20: `npm run build && npm run lint && npm test`

---

## Edge Cases — Updated

Additions/modifications from consolidated plan:

| #   | Scenario                                                   | Behaviour                                    | Mechanism                                                           |
| --- | ---------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| 34  | `failStrategy: 'closed'`, DB down during check             | 503 returned, handler never called           | Middleware catches error, returns configured status code            |
| 35  | `failStrategy: 'closed'`, endpoint-level override = 'open' | Request proceeds despite global closed       | Per-endpoint `failStrategy` overrides global default                |
| 36  | Cleanup timeout mid-batch                                  | Stops, resumes next cycle                    | Batched DELETE with `budgetMs` budget; returns `timedOut: true`     |
| 37  | Two pods run cleanup concurrently                          | Each claims different rows via `SKIP LOCKED` | Subquery `SELECT ... FOR UPDATE SKIP LOCKED LIMIT batchSize`        |
| 38  | Cleanup exhausted all rows                                 | Terminates cleanly                           | `DELETE` returns 0 → loop breaks                                    |
| 39  | `Clock.now()` called twice in `check()`                    | **Never happens** — captured once            | Single `const now = this.clock.now()` at top of method              |
| 40  | Config mutated during request handling                     | **Never happens**                            | `Object.freeze()` on config and all nested objects after validation |
| 41  | `digestLength` set to 7                                    | Throws at startup                            | `validateConfig()` rejects < 8                                      |
| 42  | `batchSize` set to 200_000                                 | Throws at startup                            | `validateConfig()` rejects > 100_000                                |
| 43  | `failStrategy.statusCode` is 200                           | Throws at startup                            | `validateConfig()` rejects < 400                                    |
| 44  | `shadowMode` + `strategy: 'memory'`                        | Throws at startup                            | Invalid combination check                                           |
| 45  | `proxy.trusted: true` missing `RATE_LIMIT_TRUSTED_PROXY`   | Warning in production                        | `validateConfig()` logs warning but does not throw                  |
| 46  | OpenTelemetry not configured (no SDK)                      | No-op, no crash                              | `@opentelemetry/api` returns no-op objects when SDK absent          |
| 47  | Request-level trace context                                | Spans nested under incoming request context  | `telemetry.ts` propagates via AsyncLocalStorage                     |

---

## Big O Analysis — Updated

| Operation                          | Complexity         | Notes                                                                  |
| ---------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| Config lookup                      | O(1)               | Frozen object, O(1) property access                                    |
| Role multiplier lookup             | O(1)               | Frozen object, O(1) property access                                    |
| IP extraction & hash               | O(1)               | SHA-256 fixed-length input                                             |
| AsyncLocalStorage                  | O(1)               | Thread-local get/set                                                   |
| `increment()` INSERT … ON CONFLICT | O(log n)           | Primary key B-tree index on `id`                                       |
| `pruneAppKeys()`, per batch        | O(batchSize log n) | `SELECT ... LIMIT batchSize` on partial index, `DELETE` by primary key |
| **Cleanup total**                  | O(m log n)         | m = expired rows, processed in batches of batchSize                    |
| Header injection                   | O(1)               | 3-4 `headers.set()` calls                                              |
| Structured logging                 | O(1)               | Fixed-size object serialization                                        |
| Metrics counter increment          | O(1)               | OTel batched export                                                    |
| **Total per request**              | **O(log n)**       | n = rows in `rate_limit` table                                         |

**Latency budget (unchanged):**

- p50: < 5 ms
- p95: < 15 ms
- p99: < 50 ms

---

## Updated Design Decisions

| Decision                    | Choice                                                                     | Rationale                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Failure strategy**        | Configurable `open`/`closed`, per-endpoint + global default                | Hardcoded fail-open masks DB degradation. Per-endpoint override allows critical paths (e.g., job applications) to stay open while admin endpoints fail closed. |
| **Batched cleanup**         | `DELETE ... LIMIT batchSize ... FOR UPDATE SKIP LOCKED`, time-budgeted     | Prevents table locks, WAL bloat, and timeouts. `SKIP LOCKED` enables multi-pod safety. Default batchSize=5,000, budgetMs=30,000.                               |
| **Immutable config**        | `Object.freeze()` after validation                                         | Prevents accidental mutation during request handling. Zero runtime cost after freeze.                                                                          |
| **Single clock capture**    | `this.clock.now()` called once per `check()`                               | Eliminates race between `reset` and `retryAfter` calculations using different timestamps.                                                                      |
| **Repository return type**  | `{ count: number }` (no `wasReset`)                                        | SRP: repository doesn't know about window semantics. `wasReset` would leak business rule into persistence layer.                                               |
| **Observability**           | Real OpenTelemetry via `@opentelemetry/api`                                | No-op default when SDK absent. Counters, histograms, gauges, spans for all operations.                                                                         |
| **Trace context**           | AsyncLocalStorage with `requestId`, auto-propagation                       | Structured log enrichment without passing context through every function signature.                                                                            |
| **Contract tests**          | Shared `runRepositoryContractTests()` invoked against every implementation | Zero duplication across FakeRepository, PrismaRepository, and future implementations.                                                                          |
| **Config validation**       | Runs unconditionally at startup, all environments                          | Fail-fast prevents deployment with invalid config. 20+ validation conditions covering types, bounds, combinations, env vars.                                   |
| **Benchmark metrics**       | Extended with `rps`, `allocations`, `dbQueryTimeMs`                        | Catches performance regressions beyond latency (e.g., memory leaks, throughput degradation).                                                                   |
| **Configurable thresholds** | Per-suite `regressionThreshold`, `maxAllocations`, `minRps`                | Each suite defines what "healthy" means; CI fails based on suite-specific limits.                                                                              |

---

## Documentation (Fix #10)

Create `docs/architecture/rate-limiting.md` with the following sections:

### 1. Dependency Graph

```
rateLimitConfig (immutable, frozen)
       │
Clock (interface)        RateLimitRepository (interface)
  ├─ SystemClock               ├─ PrismaRateLimitRepository (batched)
  └─ FakeClock (test)          └─ FakeRepository (test)
       │                             │
       └─────────┬───────────────────┘
                 ▼
          RateLimiter (interface)
            └─ RateLimiterImpl
                 │
                 ▼
          createWithRateLimit(factory)
            └─ middleware.ts
                 │
                 ▼
          di.ts (wires it all)
            ├─ withRateLimit (route handlers)
            └─ rateLimiter   (service-layer enforce)
```

### 2. Request Flow

Full flow diagram with each step annotated (endpoint resolution, session/IP extraction, key building, `RateLimiter.check()`, result handling, fail strategy on error).

### 3. Cleanup Flow

```
setInterval(24h)
  │
  ▼
RateLimiterImpl.prune()
  │
  ▼
repo.pruneAppKeys(cutoff, { batchSize: 5000, budgetMs: 30000 })
  │
  ├── LOOP:
  │     DELETE FROM rate_limit WHERE id IN (
  │       SELECT id ... LIMIT batchSize FOR UPDATE SKIP LOCKED
  │     )
  │     if affected_rows === 0 → EXIT
  │   while elapsed < budgetMs
  │
  └── return PruneResult { rowsDeleted, batchesExecuted, durationMs, timedOut }
```

### 4. Failure Strategy Decision

```ascii
rateLimiter.check() throws
        │
        ▼
   Read failStrategy:
   Endpoint override → endpoint.failStrategy
   No override      → failStrategy.default
        │
        ├── "open"  → log, proceed with handler
        └── "closed" → log, return 503 (configurable statusCode)
```

### 5. Observability

- **Counters**: `rate_limit.decisions` (decision, endpoint, role), `rate_limit.db_failures`, `rate_limit.cleanup_rows`, `rate_limit.cleanup_batches`, `rate_limit.cleanup_timeouts`
- **Histograms**: `rate_limit.check_duration_ms`, `rate_limit.db_latency_ms`, `rate_limit.cleanup_duration_ms`
- **Gauges**: `rate_limit.active_app_keys`
- **Spans**: `rate_limit.check` with attributes `key`, `max`, `allowed`, `duration_ms`
- **Structured log fields**: `requestId`, `endpoint`, `role`, `strategy`, `decision`, `duration`, `error`, `failStrategy`

### 6. Repository Contract Expectations

Every `RateLimitRepository` must pass `runRepositoryContractTests()`. The contract verifies:

- `increment` creates new rows, increments existing, resets on window expiry, handles concurrent callers
- `deleteById` removes only the specified key
- `deleteAllAppKeys` removes `app:` prefixed rows only
- `pruneAppKeys` removes expired rows and returns accurate counts

### 7. Extension Guide: Adding Redis Strategy

1. Create `lib/rate-limiting/repository-redis.ts`
2. Implement `RateLimitRepository` interface using Redis `MULTI`/`EXEC` with `INCR` + `EXPIRE`
3. Create `repository.redis.test.ts` running `runRepositoryContractTests()`
4. Add `redis` case to `createStore()` in config
5. Create `lib/rate-limiting/repository-redis.contract.test.ts` running shared contract suite

### 8. Extension Guide: Adding New Endpoint Limits

1. Add entry to `rateLimitConfig.endpoints` with `{ max, windowMs, failStrategy? }`
2. TypeScript ensures `RateLimitEndpoint` union expands automatically
3. Wrap target route with `withRateLimit(handler, 'new:endpoint')`

### 9. Extension Guide: Adding New Roles

1. Add entry to `rateLimitConfig.roles` with `{ multiplier }`
2. Route handler's `session.user.role` is automatically matched — no code changes needed

---

## Files Touched (Complete)

| File                                                          | Action                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `lib/rate-limiting/types.ts`                                  | Create — add `CleanupConfig`, `FailStrategyConfig`, `PruneResult`; `EndpointLimit` gains `failStrategy` |
| `lib/rate-limiting/config.ts`                                 | Create — expanded validation (20+ conditions), `freezeConfig()`, `failStrategy`, batched cleanup config |
| `lib/rate-limiting/clock.ts`                                  | Create                                                                                                  |
| `lib/rate-limiting/repository.ts`                             | Create — `pruneAppKeys` returns `PruneResult`, accepts options; batched DELETE with `SKIP LOCKED`       |
| `lib/rate-limiting/rate-limiter.ts`                           | Create — single clock capture, cleanup metrics recording                                                |
| `lib/rate-limiting/middleware.ts`                             | Create — configurable fail strategy (open/closed), per-endpoint override                                |
| `lib/rate-limiting/di.ts`                                     | Create — calls `validateConfig()` + `freezeConfig()` at module level                                    |
| `lib/rate-limiting/metrics.ts`                                | Create — real OTel counters, histograms, gauges, spans                                                  |
| `lib/rate-limiting/telemetry.ts`                              | Create — AsyncLocalStorage trace context, `enrichLog()`, `generateRequestId()`                          |
| `lib/rate-limiting/request-context.ts`                        | Create                                                                                                  |
| `lib/rate-limiting/ip-hash.ts`                                | Create                                                                                                  |
| `lib/rate-limiting/cleanup.ts`                                | Create — `startCleanup()`/`stopCleanup()` using `setInterval` + `unref()`                               |
| `lib/rate-limiting/repository.fake.ts`                        | Create — in-memory `FakeRepository` for tests                                                           |
| `lib/test/unit/rate-limiting/contract/repository-contract.ts` | Create — shared contract test suite                                                                     |
| `lib/test/unit/rate-limiting/config.test.ts`                  | Create                                                                                                  |
| `lib/test/unit/rate-limiting/clock.test.ts`                   | Create                                                                                                  |
| `lib/test/unit/rate-limiting/rate-limiter.test.ts`            | Create — single-clock-capture verification                                                              |
| `lib/test/unit/rate-limiting/middleware.test.ts`              | Create — fail strategy scenarios                                                                        |
| `lib/test/unit/rate-limiting/repository.fake.test.ts`         | Create — runs contract suite                                                                            |
| `lib/test/unit/rate-limiting/repository.prisma.test.ts`       | Create — integration + contract suite                                                                   |
| `lib/test/unit/rate-limiting/concurrency.test.ts`             | Create                                                                                                  |
| `lib/test/unit/rate-limiting/fuzz.test.ts`                    | Create                                                                                                  |
| `lib/test/unit/rate-limiting/chaos.test.ts`                   | Create — fail-closed chaos                                                                              |
| `lib/test/unit/rate-limiting/benchmark.test.ts`               | Create — extended metrics                                                                               |
| `lib/test/unit/rate-limiting/ip-hash.test.ts`                 | Create                                                                                                  |
| `lib/test/unit/rate-limiting/metrics.test.ts`                 | Create                                                                                                  |
| `lib/test/unit/rate-limiting/telemetry.test.ts`               | Create                                                                                                  |
| `lib/test/unit/rate-limiting/cleanup.test.ts`                 | Create                                                                                                  |
| `lib/test/unit/rate-limiting/request-context.test.ts`         | Create                                                                                                  |
| `lib/test/perf.ts`                                            | Modify — add `rps`, `allocations`, `dbQueryTimeMs` to `BenchmarkResult`                                 |
| `app/features/shared/api/require-role.ts`                     | Modify — add AsyncLocalStorage cache check                                                              |
| `app/api/jobs/[id]/view/route.ts`                             | Modify                                                                                                  |
| `app/api/jobs/[id]/apply/route.ts`                            | Modify                                                                                                  |
| `lib/services/message-service.ts`                             | Modify                                                                                                  |
| `app/api/user/resumes/[id]/ai-enhance/route.ts`               | Modify                                                                                                  |
| `app/api/messages/threads/route.ts`                           | Modify                                                                                                  |
| `app/api/notifications/route.ts`                              | Modify                                                                                                  |
| `app/api/user/profile/route.ts`                               | Modify                                                                                                  |
| `app/api/user/resumes/route.ts`                               | Modify                                                                                                  |
| `app/api/user/applications/route.ts`                          | Modify                                                                                                  |
| `app/api/user/bookmarks/route.ts`                             | Modify                                                                                                  |
| `app/features/recruiter/queries/analytics-queries.ts`         | Modify — $queryRawUnsafe → Prisma.sql                                                                   |
| `lib/rate-limit.ts`                                           | Delete                                                                                                  |
| `lib/repositories/rate-limit-repository.ts`                   | Delete                                                                                                  |
| `app/features/recruiter/libs/rate-limit-message.ts`           | Delete                                                                                                  |
| `lib/test/unit/rate-limit.test.ts`                            | Delete                                                                                                  |
| `lib/test/unit/rate-limit-message.test.ts`                    | Delete                                                                                                  |
| `docs/architecture/rate-limiting.md`                          | Create — architecture documentation                                                                     |
| `benchmark/baseline.json`                                     | Modify — add `regressionThreshold`, `maxAllocations`, `minRps` per suite                                |
| `scripts/compare-benchmark.ts`                                | Modify — compare richer metrics (allocations, rps)                                                      |
| `package.json`                                                | Add `@opentelemetry/api` dependency                                                                     |

---

## Rollout Order

1. `types.ts` — pure types
2. `config.ts` — config + `validateConfig()` + `freezeConfig()`
3. `clock.ts` — `Clock` interface + `SystemClock`
4. `repository.ts` — `RateLimitRepository` interface + `PrismaRateLimitRepository` (batched cleanup)
5. `rate-limiter.ts` — `RateLimiter` interface + `RateLimiterImpl` (single clock capture, cleanup metrics)
6. `middleware.ts` — `createWithRateLimit(rateLimiter)` factory (configurable fail strategy)
7. `di.ts` — wiring with `validateConfig()` + `freezeConfig()` at import time
8. `metrics.ts` — real OpenTelemetry instrumentation
9. `telemetry.ts` — AsyncLocalStorage trace context
10. `request-context.ts` — session cache
11. Modify `require-role.ts` — cache check
12. `ip-hash.ts` — deterministic hashing
13. `cleanup.ts` — batched cleanup orchestrator
14. `repository.fake.ts` — in-memory FakeRepository
15. Wire existing routes (4 files)
16. Wire unprotected routes (6 files)
17. Write tests in order:
    - `contract/repository-contract.ts` (shared suite)
    - Unit tests (config, clock, rate-limiter, middleware, ip-hash, metrics, telemetry, cleanup, request-context)
    - `repository.fake.test.ts` (contract)
    - `repository.prisma.test.ts` (integration + contract)
    - concurrency, fuzz, chaos, benchmark
    - E2E
18. Remove dead code (5 files)
19. `analytics-queries.ts` refactoring (parallel)
20. Create `docs/architecture/rate-limiting.md`
21. `npm install @opentelemetry/api`
22. Update `benchmark/baseline.json` with extended thresholds
23. Update `scripts/compare-benchmark.ts` with richer metric comparison
24. `npm run build && npm run lint && npm test`

---

## Validation

All validations from the consolidated plan, plus:

- **`validateConfig()` tests**: 20+ scenarios (type errors, bounds, invalid combos, missing env vars, unsupported strategies) all throw with specific messages
- **Freeze test**: `Object.isFrozen(rateLimitConfig)` is true after `freezeConfig()`. Mutating any nested property throws in strict mode
- **Fail strategy test**: Mock DB error with `failStrategy: 'closed'` → 503 response, handler never called. `failStrategy: 'open'` → handler called
- **Per-endpoint override test**: Endpoint A has `failStrategy: 'closed'`, endpoint B has `failStrategy: 'open'`, global default is `'closed'`. DB error on A → 503. DB error on B → handler proceeds
- **Batched cleanup test**: Insert 10,001 expired rows, `batchSize=5000`, `budgetMs=30000`. Verify 3 batches executed, `timedOut=false`, all rows deleted. Same with `budgetMs=1` → `timedOut=true`, partial deletion
- **Single clock capture test**: `FakeClock` returns deterministic time. Verify `retryAfter` and `reset` are computed from the same `now` value (diff < 1)
- **Contract test equivalence**: `FakeRepository` and `PrismaRateLimitRepository` both pass identical `runRepositoryContractTests()` suite
- **OpenTelemetry no-op test**: No OTel SDK configured → no crash, no-op objects used
- **Trace context test**: Logs inside `runWithTraceContext()` contain `requestId` field
- **Benchmark extended metrics**: `compare-benchmark.ts` checks `allocations` budget, `rps` minimum, and `regressionThreshold` per suite. Fails CI if any threshold breached
- **`@opentelemetry/api` installed**: `npm ls @opentelemetry/api` returns installed version
- **`store.ts` and `core.ts` do NOT exist**: replaced by `repository.ts` + `rate-limiter.ts` before creation
