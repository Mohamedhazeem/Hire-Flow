import { AsyncLocalStorage } from "node:async_hooks";

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

export function generateRequestId(): string {
  return crypto.randomUUID().substring(0, 12);
}

export function enrichLog(base: Record<string, unknown>): Record<string, unknown> {
  const ctx = getTraceContext();
  if (ctx) {
    base.requestId = ctx.requestId;
  }
  return base;
}
