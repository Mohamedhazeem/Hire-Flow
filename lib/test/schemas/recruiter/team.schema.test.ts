import { describe, it, expect } from "vitest";
import {
  RecruiterInviteSchema,
  RecruiterBulkInviteSchema,
} from "@/app/features/recruiter/schema/team.schema";

describe("RecruiterInviteSchema", () => {
  it("accepts a valid invite email", () => {
    const result = RecruiterInviteSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = RecruiterInviteSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });
});

describe("RecruiterBulkInviteSchema", () => {
  it("accepts valid bulk emails, transforms to array, deduplicates", () => {
    const result = RecruiterBulkInviteSchema.safeParse({
      emails: "a@b.com, c@d.com, a@b.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emails).toEqual(["a@b.com", "c@d.com"]);
    }
  });

  it("rejects empty raw emails", () => {
    const result = RecruiterBulkInviteSchema.safeParse({ emails: "" });
    expect(result.success).toBe(false);
  });

  it("rejects bulk with more than 50 emails", () => {
    const manyEmails = Array.from({ length: 51 }, (_, i) => `user${i}@test.com`).join(", ");
    const result = RecruiterBulkInviteSchema.safeParse({ emails: manyEmails });
    expect(result.success).toBe(false);
  });
});
