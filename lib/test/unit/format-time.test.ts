import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTime } from "@/utils/format-time";

describe("formatTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-14T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns time string for today", () => {
    const today = new Date("2026-07-14T08:30:00Z").toISOString();
    const result = formatTime(today);
    expect(result).toMatch(/^\d{2}:\d{2}/);
  });

  it('returns "Yesterday" for one day ago', () => {
    const yesterday = new Date("2026-07-13T10:00:00Z").toISOString();
    expect(formatTime(yesterday)).toBe("Yesterday");
  });

  it("returns weekday abbreviation for less than 7 days", () => {
    const threeDaysAgo = new Date("2026-07-11T10:00:00Z").toISOString();
    const result = formatTime(threeDaysAgo);
    expect(result).toMatch(/^(Sat|Sun|Mon|Tue|Wed|Thu|Fri)$/);
  });

  it("returns short date for older dates", () => {
    const oldDate = new Date("2025-12-25T10:00:00Z").toISOString();
    const result = formatTime(oldDate);
    expect(result).toMatch(/\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
  });
});
