import { describe, it, expect } from "vitest";
import { formatPascalCase } from "@/utils/format-string";

describe("formatPascalCase", () => {
  it("converts snake_case to Pascal Case", () => {
    expect(formatPascalCase("hello_world")).toBe("Hello World");
  });

  it("converts kebab-case to Pascal Case", () => {
    expect(formatPascalCase("hello-world")).toBe("Hello World");
  });

  it("handles single word", () => {
    expect(formatPascalCase("hello")).toBe("Hello");
  });

  it("returns empty string for empty input", () => {
    expect(formatPascalCase("")).toBe("");
  });

  it("handles multiple separators", () => {
    expect(formatPascalCase("hello_world-test_case")).toBe("Hello World Test Case");
  });

  it("handles unicode characters", () => {
    const result = formatPascalCase("hello_world_123");
    expect(result).toBe("Hello World 123");
  });
});
