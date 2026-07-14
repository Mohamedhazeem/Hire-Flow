import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

const mockNextResponseJson = vi.fn();
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: (...args: unknown[]) => mockNextResponseJson(...args),
  },
}));

vi.mock("@/utils/logger", () => ({
  logger: {
    server: { error: vi.fn() },
    client: { error: vi.fn() },
    api: { error: vi.fn() },
    db: { error: vi.fn() },
  },
}));

const mockFail = vi.fn();
vi.mock("@/lib/api/api-response", () => ({
  fail: (...args: unknown[]) => mockFail(...args),
}));

describe("withErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns successful response from handler", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const { NextResponse } = await import("next/server");

    const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true, data: "ok" }));
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("catches ZodError and returns 422 with field details", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const handler = vi.fn().mockRejectedValue(new z.ZodError([
      { code: "too_small", minimum: 1, type: "string", inclusive: true, exact: false, message: "Required", path: ["name"] },
    ]));

    mockNextResponseJson.mockReturnValue({ status: 422 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" }),
      { status: 422 },
    );
  });

  it("catches UnauthorizedError and returns 401", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const { UnauthorizedError } = await import("@/lib/api/api-error");
    const handler = vi.fn().mockRejectedValue(new UnauthorizedError());

    mockFail.mockReturnValue({ status: 401 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockFail).toHaveBeenCalledWith("Authentication required", 401);
  });

  it("catches ForbiddenError and returns 403", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const { ForbiddenError } = await import("@/lib/api/api-error");
    const handler = vi.fn().mockRejectedValue(new ForbiddenError());

    mockFail.mockReturnValue({ status: 403 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockFail).toHaveBeenCalledWith("Insufficient permissions", 403);
  });

  it("catches NotFoundError and returns 404", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const { NotFoundError } = await import("@/lib/api/api-error");
    const handler = vi.fn().mockRejectedValue(new NotFoundError());

    mockFail.mockReturnValue({ status: 404 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockFail).toHaveBeenCalledWith("Resource not found", 404);
  });

  it("catches ValidationError and returns 400", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const { ValidationError } = await import("@/lib/api/api-error");
    const handler = vi.fn().mockRejectedValue(new ValidationError());

    mockFail.mockReturnValue({ status: 400 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockFail).toHaveBeenCalledWith("Invalid request", 400);
  });

  it("catches ConflictError and returns 409", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const { ConflictError } = await import("@/lib/api/api-error");
    const handler = vi.fn().mockRejectedValue(new ConflictError());

    mockFail.mockReturnValue({ status: 409 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockFail).toHaveBeenCalledWith("Resource conflict", 409);
  });

  it("catches TooManyRequestsError and returns 429", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const { TooManyRequestsError } = await import("@/lib/api/api-error");
    const handler = vi.fn().mockRejectedValue(new TooManyRequestsError());

    mockFail.mockReturnValue({ status: 429 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockFail).toHaveBeenCalledWith("Too many requests", 429);
  });

  it("catches unknown Error and returns 500", async () => {
    const { withErrorHandler } = await import("@/lib/api/api-wrapper");
    const handler = vi.fn().mockRejectedValue(new Error("Unknown"));

    mockFail.mockReturnValue({ status: 500 });
    const wrapped = withErrorHandler(handler);
    const req = new Request("http://localhost/api/test");
    await wrapped(req as never);

    expect(mockFail).toHaveBeenCalledWith("Internal server error", 500);
  });
});
