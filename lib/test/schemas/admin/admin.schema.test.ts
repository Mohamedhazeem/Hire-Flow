import { describe, it, expect } from "vitest";
import {
  AdminBanUserSchema,
  AdminInviteSchema,
  AdminListUsersParamsSchema,
} from "@/app/features/admin/schema/admin.schema";

describe("AdminBanUserSchema", () => {
  it("accepts a valid ban input", () => {
    const result = AdminBanUserSchema.safeParse({
      banReason: "Policy violation",
      banExpiresIn: 86400,
    });
    expect(result.success).toBe(true);
  });

  it("accepts banReason with HTML/SQL payloads (no sanitization, max 500 only)", () => {
    const result = AdminBanUserSchema.safeParse({
      banReason: "<script>alert('xss')</script>', 1=1; --",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative banExpiresIn", () => {
    const result = AdminBanUserSchema.safeParse({ banExpiresIn: -100 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("banExpiresIn");
  });

  it("rejects banReason exceeding 500 chars", () => {
    const result = AdminBanUserSchema.safeParse({ banReason: "A".repeat(501) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("banReason");
  });

  it("accepts empty payload (all optional)", () => {
    const result = AdminBanUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("AdminInviteSchema", () => {
  it("accepts a valid email", () => {
    const result = AdminInviteSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = AdminInviteSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });
});

describe("AdminListUsersParamsSchema", () => {
  it("accepts valid params", () => {
    const result = AdminListUsersParamsSchema.safeParse({ page: 1, pageSize: 20 });
    expect(result.success).toBe(true);
  });

  it("provides defaults for empty input", () => {
    const result = AdminListUsersParamsSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.banned).toBe("all");
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });
});
