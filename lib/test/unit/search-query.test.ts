import { describe, it, expect } from "vitest";
import { formatSearchQuery } from "@/app/features/jobs/queries/public-job-queries";

/**
 * Unit coverage for the public-job full-text query sanitizer (S1–S5).
 *
 * `formatSearchQuery` is the single boundary that turns untrusted user input
 * into a Postgres `tsquery` string (Prisma `{ search }`). It must:
 *  - strip tsquery/SQL metacharacters per-token (S1, S5)
 *  - return "" for empty/whitespace/all-punctuation input so the caller skips
 *    the OR filter and returns all rows (S2)
 *  - bound length + token count so a huge string cannot build a huge tsquery (S3)
 *  - preserve non-ASCII (unicode) word characters (S4)
 */
describe("formatSearchQuery (S1–S5)", () => {
  describe("S1 — special characters", () => {
    it("strips tsquery metacharacters, splitting on them", () => {
      expect(formatSearchQuery("Front&end")).toBe("Front | end");
      expect(formatSearchQuery("(react)")).toBe("react");
      expect(formatSearchQuery("dev*")).toBe("dev");
    });

    it("splits punctuation-joined words instead of merging them", () => {
      // Regression: a whole-string strip would produce "CJava"; we want two tokens.
      expect(formatSearchQuery("C++/Java")).toBe("C | Java");
      expect(formatSearchQuery("node.js")).toBe("node | js");
    });

    it("returns empty string when input is only special characters", () => {
      expect(formatSearchQuery("&|!*()")).toBe("");
      expect(formatSearchQuery("!!!")).toBe("");
    });

    it("joins multiple real words with the OR operator", () => {
      expect(formatSearchQuery("senior frontend engineer")).toBe("senior | frontend | engineer");
    });
  });

  describe("S2 — empty search", () => {
    it("returns empty string for empty input", () => {
      expect(formatSearchQuery("")).toBe("");
    });

    it("returns empty string for whitespace-only input", () => {
      expect(formatSearchQuery("   \t\n ")).toBe("");
    });
  });

  describe("S3 — very long search string", () => {
    it("caps the number of tokens", () => {
      const input = Array.from({ length: 100 }, (_, i) => `word${i}`).join(" ");
      const result = formatSearchQuery(input);
      const tokens = result.split(" | ");
      expect(tokens.length).toBeLessThanOrEqual(20);
    });

    it("does not crash on a huge single token and bounds its length", () => {
      const input = "a".repeat(10_000);
      const result = formatSearchQuery(input);
      // A single token, truncated to the max search length (200).
      expect(result.length).toBeLessThanOrEqual(200);
      expect(result).toContain("a");
    });
  });

  describe("S4 — unicode terms", () => {
    it("preserves accented latin characters", () => {
      expect(formatSearchQuery("Café")).toBe("Café");
      expect(formatSearchQuery("Ingeniería")).toBe("Ingeniería");
    });

    it("preserves CJK characters", () => {
      expect(formatSearchQuery("エンジニア")).toBe("エンジニア");
      expect(formatSearchQuery("工程师")).toBe("工程师");
    });

    it("keeps unicode words while still stripping metacharacters", () => {
      expect(formatSearchQuery("Café & Bar")).toBe("Café | Bar");
    });
  });

  describe("S5 — SQL-like payloads", () => {
    it("reduces a SQL injection payload to safe space-separated tokens", () => {
      const result = formatSearchQuery('\'; SELECT * FROM "user"; --');
      // No quotes, semicolons, asterisks, or dashes survive as metacharacters.
      expect(result).not.toContain(";");
      expect(result).not.toContain("'");
      expect(result).not.toContain("*");
      expect(result).not.toContain('"');
      expect(result).toContain("SELECT");
      expect(result).toContain("FROM");
      expect(result).toContain("user");
    });
  });
});
