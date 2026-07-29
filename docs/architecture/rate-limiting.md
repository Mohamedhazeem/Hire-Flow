# Rate Limiting Architecture

## Dependency Graph

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

## Request Flow

1. Incoming request hits a route wrapped with `withRateLimit(handler, endpointKey)`
2. Middleware checks `rateLimitConfig.enabled` — if disabled, passes through
3. Session is resolved via `getSession()` (or cache)
4. Role is extracted from session to compute effective max via role multiplier
5. Actor key is built: authenticated users use `session.user.id`, anonymous use IP hash
6. DB key is constructed as `app:{endpoint}:{actor}`
7. Fail strategy is determined: per-endpoint override or global default
8. `RateLimiterImpl.check()` is called:
   - `Clock.now()` is captured once
   - `repository.increment()` runs atomic `INSERT ... ON CONFLICT ... RETURNING`
   - `reset`, `retryAfter` are derived from the single `now` timestamp
9. If `allowed === false` and not in shadow mode → 429 response with rate limit headers
10. If DB error occurs during check → configured fail strategy:
    - `open`: request proceeds with error logged
    - `closed`: 503 returned (configurable status code)
11. Handler runs, rate limit headers injected into response

## Cleanup Flow

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

## Failure Strategy Decision

```
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

## Observability

- **Counters**: `rate_limit.decisions` (decision, endpoint, role), `rate_limit.db_failures`, `rate_limit.cleanup_rows`, `rate_limit.cleanup_batches`, `rate_limit.cleanup_timeouts`
- **Histograms**: `rate_limit.check_duration_ms`, `rate_limit.db_latency_ms`, `rate_limit.cleanup_duration_ms`
- **Gauges**: `rate_limit.active_app_keys`
- **Spans**: `rate_limit.check` with attributes `key`, `max`, `allowed`, `duration_ms`
- **Structured log fields**: `requestId`, `endpoint`, `role`, `strategy`, `decision`, `duration`, `error`, `failStrategy`

## Repository Contract Expectations

Every `RateLimitRepository` must pass `runRepositoryContractTests()`. The contract verifies:

- `increment` creates new rows, increments existing, resets on window expiry, handles concurrent callers
- `deleteById` removes only the specified key
- `deleteAllAppKeys` removes `app:` prefixed rows only
- `pruneAppKeys` removes expired rows and returns accurate counts

### Adding a Redis Strategy

1. Create `lib/rate-limiting/repository-redis.ts`
2. Implement `RateLimitRepository` interface using Redis `MULTI`/`EXEC` with `INCR` + `EXPIRE`
3. Create `repository.redis.test.ts` running `runRepositoryContractTests()`
4. Add `redis` case to `createStore()` in config

### Adding New Endpoint Limits

1. Add entry to `rateLimitConfig.endpoints` with `{ max, windowMs, failStrategy? }`
2. TypeScript ensures `RateLimitEndpoint` union expands automatically
3. Wrap target route with `withRateLimit(handler, 'new:endpoint')`

### Adding New Roles

1. Add entry to `rateLimitConfig.roles` with `{ multiplier }`
2. Route handler's `session.user.role` is automatically matched — no code changes needed
