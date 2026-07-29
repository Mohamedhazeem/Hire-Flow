import { describe, it, expect } from "vitest";
import { escapeCsvField, buildCsvRow, buildCsvString } from "@/app/features/recruiter/libs/csv-builder";

describe("escapeCsvField", () => {
  it("wraps normal string in quotes", () => {
    expect(escapeCsvField("hello")).toBe('"hello"');
  });

  it("escapes embedded double quotes", () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps strings with commas in quotes", () => {
    expect(escapeCsvField("a,b")).toBe('"a,b"');
  });

  it("wraps strings with newlines", () => {
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("returns empty quoted string for empty input", () => {
    expect(escapeCsvField("")).toBe('""');
  });

  it("handles unicode content", () => {
    expect(escapeCsvField("café")).toBe('"café"');
  });
});

describe("buildCsvRow", () => {
  it("joins fields with commas and appends CRLF", () => {
    const row = buildCsvRow(["a", "b", "c"]);
    expect(row).toBe('"a","b","c"\r\n');
  });

  it("escapes values with special characters", () => {
    const row = buildCsvRow(['he said "hello"', "normal"]);
    expect(row).toBe('"he said ""hello""","normal"\r\n');
  });
});

describe("buildCsvString", () => {
  it("prepends BOM and includes header row + data rows", () => {
    const result = buildCsvString(
      ["Name", "Email"],
      [
        ["Alice", "alice@test.com"],
        ["Bob", "bob@test.com"],
      ],
    );
    expect(result.startsWith("\uFEFF")).toBe(true);
    expect(result).toContain('"Name","Email"');
    expect(result).toContain('"Alice","alice@test.com"');
    expect(result).toContain('"Bob","bob@test.com"');
  });

  it("returns BOM + header only when data is empty", () => {
    const result = buildCsvString(["Name"], []);
    expect(result).toBe('\uFEFF"Name"\r\n');
  });
});
