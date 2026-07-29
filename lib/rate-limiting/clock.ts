import type { Clock } from "./types";

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}

export class FakeClock implements Clock {
  private _now: number;

  constructor(initialMs: number = Date.now()) {
    this._now = initialMs;
  }

  now(): number {
    return this._now;
  }

  advance(ms: number): void {
    this._now += ms;
  }

  setTime(ms: number): void {
    this._now = ms;
  }
}
