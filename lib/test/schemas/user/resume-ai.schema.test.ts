import { describe, it, expect } from "vitest";
import { EnhancementsResponseSchema } from "@/app/features/user/schema/resume-ai.schema";

const validResponse = {
  suggestions: [
    {
      type: "grammar" as const,
      section: "summary",
      original: "I am a good worker",
      suggestion: "Proven track record of delivering results",
      reasoning: "More impactful phrasing",
      priority: "high" as const,
    },
  ],
  overallScore: 75,
  projectedScore: 85,
  keyStrengths: ["Strong technical background"],
  improvementAreas: ["Leadership skills"],
};

describe("EnhancementsResponseSchema", () => {
  it("accepts a valid full response", () => {
    const result = EnhancementsResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("accepts an empty suggestions array", () => {
    const result = EnhancementsResponseSchema.safeParse({ ...validResponse, suggestions: [] });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid suggestion type", () => {
    const result = EnhancementsResponseSchema.safeParse({
      ...validResponse,
      suggestions: [{ ...validResponse.suggestions[0], type: "invalid_type" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects suggestion missing required fields", () => {
    const result = EnhancementsResponseSchema.safeParse({
      ...validResponse,
      suggestions: [{ type: "grammar" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects reasoning exceeding 500 chars", () => {
    const result = EnhancementsResponseSchema.safeParse({
      ...validResponse,
      suggestions: [{ ...validResponse.suggestions[0], reasoning: "A".repeat(501) }],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("reasoning");
  });

  it("rejects overallScore below 0", () => {
    const result = EnhancementsResponseSchema.safeParse({ ...validResponse, overallScore: -1 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("overallScore");
  });

  it("rejects overallScore above 100", () => {
    const result = EnhancementsResponseSchema.safeParse({ ...validResponse, overallScore: 101 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("overallScore");
  });

  it("accepts empty keyStrengths", () => {
    const result = EnhancementsResponseSchema.safeParse({ ...validResponse, keyStrengths: [] });
    expect(result.success).toBe(true);
  });

  it("accepts empty improvementAreas", () => {
    const result = EnhancementsResponseSchema.safeParse({ ...validResponse, improvementAreas: [] });
    expect(result.success).toBe(true);
  });

  it("rejects priority not in enum", () => {
    const result = EnhancementsResponseSchema.safeParse({
      ...validResponse,
      suggestions: [{ ...validResponse.suggestions[0], priority: "urgent" }],
    });
    expect(result.success).toBe(false);
  });
});
