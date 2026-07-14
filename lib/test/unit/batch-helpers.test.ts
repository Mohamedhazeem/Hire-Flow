import { describe, it, expect } from "vitest";
import { BulkEmailsSchema } from "@/lib/batch-helpers";

describe("BulkEmailsSchema", () => {
  it("parses comma-separated emails", async () => {
    const result = await BulkEmailsSchema.safeParse("a@b.com, c@d.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["a@b.com", "c@d.com"]);
    }
  });

  it("parses newline-separated emails", async () => {
    const result = await BulkEmailsSchema.safeParse("a@b.com\nc@d.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["a@b.com", "c@d.com"]);
    }
  });

  it("deduplicates emails", async () => {
    const result = await BulkEmailsSchema.safeParse("a@b.com, a@b.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["a@b.com"]);
    }
  });

  it("rejects empty string", async () => {
    const result = await BulkEmailsSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", async () => {
    const result = await BulkEmailsSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("limits to 50 emails", async () => {
    const manyEmails = Array.from({ length: 51 }, (_, i) => `email${i}@test.com`).join(",");
    const result = await BulkEmailsSchema.safeParse(manyEmails);
    expect(result.success).toBe(false);
  });

  it("trims whitespace", async () => {
    const result = await BulkEmailsSchema.safeParse("  a@b.com , c@d.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["a@b.com", "c@d.com"]);
    }
  });
});
