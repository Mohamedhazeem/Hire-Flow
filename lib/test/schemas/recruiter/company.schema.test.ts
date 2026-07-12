import { describe, it, expect } from "vitest";
import { CompanyProfileSchema } from "@/app/features/recruiter/schema/company.schema";

describe("CompanyProfileSchema", () => {
  it("accepts a valid company profile", () => {
    const result = CompanyProfileSchema.safeParse({
      name: "Acme Corp",
      description: "We build things",
      website: "https://acme.com",
      industry: "Technology",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CompanyProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("name");
  });

  it("rejects name exceeding 255 chars", () => {
    const result = CompanyProfileSchema.safeParse({ name: "A".repeat(256) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("name");
  });

  it("rejects description exceeding 2000 chars", () => {
    const result = CompanyProfileSchema.safeParse({
      name: "Acme",
      description: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("description");
  });

  it("rejects industry exceeding 100 chars", () => {
    const result = CompanyProfileSchema.safeParse({
      name: "Acme",
      industry: "A".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("industry");
  });

  it("accepts payload with only name (all other fields optional)", () => {
    const result = CompanyProfileSchema.safeParse({ name: "Acme" });
    expect(result.success).toBe(true);
  });

  it("website field is currently z.string() not z.string().url()", () => {
    const result = CompanyProfileSchema.safeParse({ name: "Acme", website: "not-a-url" });
    expect(result.success).toBe(true);
  });
});
