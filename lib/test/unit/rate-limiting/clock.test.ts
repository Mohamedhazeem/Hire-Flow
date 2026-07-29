import { describe, it, expect } from "vitest";

describe("Clock", () => {
  it("SystemClock returns current time", async () => {
    const { SystemClock } = await import("@/lib/rate-limiting/clock");
    const clock = new SystemClock();
    const now = clock.now();
    expect(now).toBeGreaterThan(0);
    expect(Math.abs(now - Date.now())).toBeLessThan(100);
  });

  it("FakeClock starts at given time", async () => {
    const { FakeClock } = await import("@/lib/rate-limiting/clock");
    const clock = new FakeClock(1000);
    expect(clock.now()).toBe(1000);
  });

  it("FakeClock advance moves time forward", async () => {
    const { FakeClock } = await import("@/lib/rate-limiting/clock");
    const clock = new FakeClock(1000);
    clock.advance(500);
    expect(clock.now()).toBe(1500);
  });

  it("FakeClock setTime sets time", async () => {
    const { FakeClock } = await import("@/lib/rate-limiting/clock");
    const clock = new FakeClock(1000);
    clock.setTime(9999);
    expect(clock.now()).toBe(9999);
  });
});
