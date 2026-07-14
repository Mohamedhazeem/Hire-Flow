import { describe, it, expect } from "vitest";
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  TooManyRequestsError,
} from "@/lib/api/api-error";

describe("ApiError", () => {
  it("has correct name and custom status", () => {
    const err = new ApiError("Custom error", 418);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(418);
    expect(err.message).toBe("Custom error");
  });

  it("extends Error", () => {
    expect(new ApiError("x", 500)).toBeInstanceOf(Error);
  });
});

describe("UnauthorizedError", () => {
  it("has default status and message", () => {
    const err = new UnauthorizedError();
    expect(err.name).toBe("UnauthorizedError");
    expect(err.message).toBe("Authentication required");
  });

  it("accepts custom message", () => {
    const err = new UnauthorizedError("Custom auth error");
    expect(err.message).toBe("Custom auth error");
  });

  it("extends Error", () => {
    expect(new UnauthorizedError()).toBeInstanceOf(Error);
  });
});

describe("ForbiddenError", () => {
  it("has default status and message", () => {
    const err = new ForbiddenError();
    expect(err.name).toBe("ForbiddenError");
    expect(err.message).toBe("Insufficient permissions");
  });

  it("accepts custom message", () => {
    const err = new ForbiddenError("Custom forbidden");
    expect(err.message).toBe("Custom forbidden");
  });

  it("extends Error", () => {
    expect(new ForbiddenError()).toBeInstanceOf(Error);
  });
});

describe("NotFoundError", () => {
  it("has default status and message", () => {
    const err = new NotFoundError();
    expect(err.name).toBe("NotFoundError");
    expect(err.message).toBe("Resource not found");
  });

  it("extends Error", () => {
    expect(new NotFoundError()).toBeInstanceOf(Error);
  });
});

describe("ValidationError", () => {
  it("has default status and message", () => {
    const err = new ValidationError();
    expect(err.name).toBe("ValidationError");
    expect(err.message).toBe("Invalid request");
  });

  it("extends Error", () => {
    expect(new ValidationError()).toBeInstanceOf(Error);
  });
});

describe("ConflictError", () => {
  it("has default status and message", () => {
    const err = new ConflictError();
    expect(err.name).toBe("ConflictError");
    expect(err.message).toBe("Resource conflict");
  });

  it("extends Error", () => {
    expect(new ConflictError()).toBeInstanceOf(Error);
  });
});

describe("TooManyRequestsError", () => {
  it("has default status and message", () => {
    const err = new TooManyRequestsError();
    expect(err.name).toBe("TooManyRequestsError");
    expect(err.message).toBe("Too many requests");
  });

  it("extends Error", () => {
    expect(new TooManyRequestsError()).toBeInstanceOf(Error);
  });
});
