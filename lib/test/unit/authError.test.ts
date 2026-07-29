import { describe, it, expect } from "vitest";
import { APIError } from "better-auth/api";
import { authError } from "@/app/features/auth/utils/authError";

function makeAPIError(
  code: string,
  statusKey: string,
  statusCode?: number,
  message?: string,
): APIError {
  const err = new APIError(statusKey as APIError["status"], { code, message });
  if (statusCode !== undefined) {
    Object.defineProperty(err, "statusCode", { value: statusCode, writable: true });
  }
  return err;
}

describe("authError", () => {
  it("handles email_not_verified", () => {
    const result = authError(makeAPIError("email_not_verified", "FORBIDDEN", 403), "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.form).toBeDefined();
      expect(result.errors!.form![0]).toContain("not verified");
    }
  });

  it("handles already_exists error", () => {
    const err = makeAPIError("already_exists", "UNPROCESSABLE_ENTITY", 422, "Email taken");
    const result = authError(err, "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.email).toBeDefined();
      expect(result.errors!.email![0]).toContain("Email taken");
    }
  });

  it("handles UNPROCESSABLE_ENTITY status", () => {
    const err = makeAPIError("some_other_code", "UNPROCESSABLE_ENTITY", 422);
    const result = authError(err, "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.email).toBeDefined();
    }
  });

  it("handles email_not_found", () => {
    const result = authError(makeAPIError("email_not_found", "NOT_FOUND", 404), "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.form?.[0]).toContain("social provider");
    }
  });

  it("handles TOO_MANY_REQUESTS", () => {
    const result = authError(makeAPIError("rate_limited", "TOO_MANY_REQUESTS", 429), "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.form?.[0]).toContain("too many attempts");
    }
  });

  it("returns fallback for SIGNUP when error is an unknown APIError", () => {
    const result = authError(makeAPIError("unknown_code", "BAD_REQUEST", 400), "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.form?.[0]).toContain("Unable to create your account");
    }
  });

  it("returns fallback for LOGIN when error is unknown", () => {
    const result = authError(makeAPIError("unknown_code", "BAD_REQUEST", 400), "LOGIN");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.form?.[0]).toContain("Unable to sign in");
    }
  });

  it("returns fallback when error is not an APIError", () => {
    const result = authError(new Error("random error"), "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.form).toBeDefined();
    }
  });

  it("returns fallback when error is null", () => {
    const result = authError(null, "SIGNUP");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.form).toBeDefined();
    }
  });
});
