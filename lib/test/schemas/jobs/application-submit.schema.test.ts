import { describe, it, expect } from "vitest";
import { ApplySchema } from "@/app/features/jobs/schema/application-submit.schema";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("ApplySchema", () => {
  it("accepts a valid payload with resumeId and coverLetter", () => {
    const result = ApplySchema.safeParse({ resumeId: validUuid, coverLetter: "I am a great fit" });
    expect(result.success).toBe(true);
  });

  it("rejects missing resumeId", () => {
    const result = ApplySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("resumeId");
  });

  it("rejects empty resumeId", () => {
    const result = ApplySchema.safeParse({ resumeId: "" });
    expect(result.success).toBe(false);
  });

  it("accepts coverLetter exactly 5000 chars", () => {
    const result = ApplySchema.safeParse({ resumeId: validUuid, coverLetter: "A".repeat(5000) });
    expect(result.success).toBe(true);
  });

  it("rejects coverLetter exceeding 5000 chars", () => {
    const result = ApplySchema.safeParse({ resumeId: validUuid, coverLetter: "A".repeat(5001) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("coverLetter");
  });

  it("trims coverLetter whitespace", () => {
    const result = ApplySchema.parse({ resumeId: validUuid, coverLetter: "  hello  " });
    expect(result.coverLetter).toBe("hello");
  });

  it("strips extra unknown fields via parse", () => {
    const result = ApplySchema.parse({ resumeId: validUuid, coverLetter: "hi", status: "hired" });
    expect(result).not.toHaveProperty("status");
  });

  it("accepts missing coverLetter (optional)", () => {
    const result = ApplySchema.safeParse({ resumeId: validUuid });
    expect(result.success).toBe(true);
  });
});
