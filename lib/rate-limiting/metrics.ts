import { metrics, trace, SpanStatusCode } from "@opentelemetry/api";
import { rateLimitConfig } from "./config";

const meter = metrics.getMeter("hire-flow.rate-limiting");
const tracer = trace.getTracer("hire-flow.rate-limiting");

const decisionCounter = meter.createCounter("rate_limit.decisions", {
  description: "Count of rate-limit decision outcomes",
});

const dbFailureCounter = meter.createCounter("rate_limit.db_failures", {
  description: "Count of DB failures during rate-limit check",
});

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

const activeKeysGauge = meter.createGauge("rate_limit.active_app_keys", {
  description: "Number of active app: rate limit rows after cleanup",
});

export function countRateLimitDecision(labels: {
  endpoint: string;
  role: string;
  decision: string;
}): void {
  decisionCounter.add(1, labels);
  if (labels.decision === "db_failure") {
    dbFailureCounter.add(1, { endpoint: labels.endpoint });
  }
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
  meter.createCounter("rate_limit.cleanup_rows").add(result.rowsDeleted);
  meter.createCounter("rate_limit.cleanup_batches").add(result.batchesExecuted);
  if (result.timedOut) {
    meter.createCounter("rate_limit.cleanup_timeouts").add(1);
  }
}

export function setActiveKeyCount(count: number): void {
  activeKeysGauge.record(count);
}

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
