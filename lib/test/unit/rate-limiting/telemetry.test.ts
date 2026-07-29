import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateRequestId,
  runWithTraceContext,
  getTraceContext,
  enrichLog,
  type TraceContext,
} from "@/lib/rate-limiting/telemetry";

describe("telemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generateRequestId returns 12-character string", async () => {
    const id = generateRequestId();
    expect(typeof id).toBe("string");
    expect(id.length).toBe(12);
  });

  it("generateRequestId returns different IDs on each call", async () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    expect(id1).not.toBe(id2);
  });

  it("runWithTraceContext runs function with provided context", async () => {
    const ctx: TraceContext = { requestId: "test-123", traceId: "trace-abc", spanId: "span-xyz" };
    let captured: TraceContext | null = null;

    await runWithTraceContext(ctx, async () => {
      captured = getTraceContext();
    });

    expect(captured).toEqual(ctx);
  });

  it("getTraceContext returns null outside of runWithTraceContext", async () => {
    expect(getTraceContext()).toBeNull();
  });

  it("nested runWithTraceContext uses inner context", async () => {
    let inner: TraceContext | null = null;
    let outer: TraceContext | null = null;

    await runWithTraceContext({ requestId: "outer" }, async () => {
      outer = getTraceContext();
      await runWithTraceContext({ requestId: "inner" }, async () => {
        inner = getTraceContext();
      });
    });

    expect((outer as TraceContext | null)?.requestId).toBe("outer");
    expect((inner as TraceContext | null)?.requestId).toBe("inner");
  });

  it("enrichLog adds requestId from trace context", async () => {
    const base = { message: "test" };
    const requestId = generateRequestId();

    await runWithTraceContext({ requestId }, async () => {
      const enriched = enrichLog(base);
      expect(enriched.requestId).toBe(requestId);
      expect(enriched.message).toBe("test");
    });
  });

  it("enrichLog does not add requestId when no context", async () => {
    const base = { message: "test" };
    const enriched = enrichLog(base);
    expect(enriched.requestId).toBeUndefined();
    expect(enriched.message).toBe("test");
  });
});
