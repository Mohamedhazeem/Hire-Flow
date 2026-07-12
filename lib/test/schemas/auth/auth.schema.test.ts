import { describe, it, expect } from "vitest";
import { SignInSchema, SignUpSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/app/features/auth/schema/auth.schema";

describe("SignInSchema", () => {
  it("accepts valid credentials", () => {
    const result = SignInSchema.safeParse({ email: "test@example.com", password: "Password1" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = SignInSchema.safeParse({ email: "not-email", password: "Password1" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("email");
  });
});

describe("SignUpSchema", () => {
  it("accepts a valid signup payload", () => {
    const result = SignUpSchema.safeParse({
      email: "test@example.com",
      password: "Password1",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name with fewer than 4 chars", () => {
    const result = SignUpSchema.safeParse({
      email: "test@example.com",
      password: "Password1",
      name: "Bob",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("name");
  });
});

describe("PasswordSchema (via SignInSchema)", () => {
  it("rejects password under 8 chars", () => {
    const result = SignInSchema.safeParse({ email: "test@example.com", password: "Ab1" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only password", () => {
    const result = SignInSchema.safeParse({ email: "test@example.com", password: "        " });
    expect(result.success).toBe(false);
  });

  it("rejects password without letters", () => {
    const result = SignInSchema.safeParse({ email: "test@example.com", password: "12345678" });
    expect(result.success).toBe(false);
  });

  it("rejects password without digits", () => {
    const result = SignInSchema.safeParse({ email: "test@example.com", password: "abcdefgh" });
    expect(result.success).toBe(false);
  });
});

describe("ForgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    const result = ForgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = ForgotPasswordSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });
});

describe("ResetPasswordSchema", () => {
  it("accepts valid token and password", () => {
    const result = ResetPasswordSchema.safeParse({ token: "valid-token", newPassword: "NewPass1" });
    expect(result.success).toBe(true);
  });

  it("rejects empty token", () => {
    const result = ResetPasswordSchema.safeParse({ token: "", newPassword: "NewPass1" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("token");
  });
});
