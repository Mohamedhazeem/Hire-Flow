import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateWithZod } from "@/lib/validator";

describe("validateWithZod", () => {
  it("returns success with parsed data for valid input", () => {
    const schema = z.string();
    const result = validateWithZod<string>(schema, "hello");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("hello");
    }
  });

  it("returns failure with flattened errors for invalid input", () => {
    const schema = z.string().email();
    const result = validateWithZod<string>(schema, "not-an-email");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("validates nested objects", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = validateWithZod<{ name: string; age: number }>(schema, { name: "Alice", age: 30 });
    expect(result.success).toBe(true);
  });

  it("returns field-level errors for nested object validation", () => {
    const schema = z.object({ name: z.string().min(1), age: z.number().min(0) });
    const result = validateWithZod<{ name: string; age: number }>(schema, { name: "", age: -1 });
    expect(result.success).toBe(false);
  });

  it("validates a number schema", () => {
    const schema = z.number().min(0).max(100);
    const result = validateWithZod<number>(schema, 50);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(50);
    }
  });
});
