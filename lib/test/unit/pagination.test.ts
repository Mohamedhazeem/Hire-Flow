import { describe, it, expect } from "vitest";
import { parseOffsetParams, buildOffsetMeta, parseCursorParams, buildCursorMeta } from "@/lib/pagination";

describe("parseOffsetParams", () => {
  it("returns defaults when no params provided", () => {
    const result = parseOffsetParams({});
    expect(result).toEqual({ skip: 0, take: 20, page: 1, pageSize: 20 });
  });

  it("respects custom page", () => {
    const result = parseOffsetParams({ page: 3 });
    expect(result.skip).toBe(40);
    expect(result.page).toBe(3);
  });

  it("respects custom pageSize", () => {
    const result = parseOffsetParams({ pageSize: 50 });
    expect(result.take).toBe(50);
  });

  it("clamps pageSize to 100", () => {
    const result = parseOffsetParams({ pageSize: 200 });
    expect(result.take).toBe(100);
  });

  it("clamps pageSize to minimum of 1", () => {
    const result = parseOffsetParams({ pageSize: 0 });
    expect(result.take).toBe(1);
  });

  it("clamps page to minimum of 1", () => {
    const result = parseOffsetParams({ page: 0 });
    expect(result.skip).toBe(0);
    expect(result.page).toBe(1);
  });

  it("clamps negative page to 1", () => {
    const result = parseOffsetParams({ page: -5 });
    expect(result.skip).toBe(0);
    expect(result.page).toBe(1);
  });

  it("uses defaultPageSize when pageSize is not provided", () => {
    const result = parseOffsetParams({}, 50);
    expect(result.take).toBe(50);
    expect(result.pageSize).toBe(50);
  });
});

describe("buildOffsetMeta", () => {
  it("page 1 of 100 items (20 per page) — 5 pages", () => {
    const meta = buildOffsetMeta(100, 1, 20);
    expect(meta.totalPages).toBe(5);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(false);
  });

  it("last page — hasPrevPage true, hasNextPage false", () => {
    const meta = buildOffsetMeta(100, 5, 20);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(true);
  });

  it("single page — no prev/next", () => {
    const meta = buildOffsetMeta(5, 1, 20);
    expect(meta.totalPages).toBe(1);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(false);
  });

  it("total=0 yields totalPages of 1", () => {
    const meta = buildOffsetMeta(0, 1, 20);
    expect(meta.totalPages).toBe(1);
  });

  it("returns correct total and page/pageSize", () => {
    const meta = buildOffsetMeta(42, 2, 10);
    expect(meta.total).toBe(42);
    expect(meta.page).toBe(2);
    expect(meta.pageSize).toBe(10);
    expect(meta.totalPages).toBe(5);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(true);
  });
});

describe("parseCursorParams", () => {
  it("returns defaults when no params provided", () => {
    const result = parseCursorParams({});
    expect(result.take).toBe(21);
    expect(result.cursor).toBeUndefined();
  });

  it("respects custom limit", () => {
    const result = parseCursorParams({ limit: 5 });
    expect(result.take).toBe(6);
  });

  it("clamps to 100", () => {
    const result = parseCursorParams({ limit: 500 });
    expect(result.take).toBe(101);
  });

  it("returns cursor when provided", () => {
    const result = parseCursorParams({ cursor: "abc123", limit: 10 });
    expect(result.cursor).toBe("abc123");
  });
});

describe("buildCursorMeta", () => {
  it("detects hasNextPage when rows exceed limit", () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({ id: `id-${i}` }));
    const result = buildCursorMeta(rows, 5);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.items).toHaveLength(5);
    expect(result.meta.nextCursor).toBe("id-4");
  });

  it("no next page when rows <= limit", () => {
    const rows = Array.from({ length: 3 }, (_, i) => ({ id: `id-${i}` }));
    const result = buildCursorMeta(rows, 5);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.items).toHaveLength(3);
    expect(result.meta.nextCursor).toBeNull();
  });

  it("empty rows returns empty items and no next page", () => {
    const result = buildCursorMeta([], 5);
    expect(result.items).toEqual([]);
    expect(result.meta.nextCursor).toBeNull();
    expect(result.meta.hasNextPage).toBe(false);
  });
});
