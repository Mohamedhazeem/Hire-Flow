import { describe, it, expect } from "vitest";
import {
  computeThreadId,
  getOtherUserId,
  participatesInThread,
  parseThreadParticipants,
  isValidThreadId,
} from "@/lib/thread-utils";

describe("computeThreadId", () => {
  it("sorts IDs to produce a consistent key", () => {
    expect(computeThreadId("b", "a")).toBe("a_b");
    expect(computeThreadId("a", "b")).toBe("a_b");
  });
});

describe("getOtherUserId", () => {
  it("extracts the other participant when userId is the prefix", () => {
    expect(getOtherUserId("a_b", "a")).toBe("b");
  });

  it("extracts the other participant when userId is the suffix", () => {
    expect(getOtherUserId("a_b", "b")).toBe("a");
  });

  it("returns null when userId is not participant", () => {
    expect(getOtherUserId("a_b", "c")).toBeNull();
  });

  it("handles userIds containing the delimiter", () => {
    const result = getOtherUserId("ab_c", "ab");
    expect(result).toBe("c");
  });
});

describe("participatesInThread", () => {
  it("returns true for a prefix participant", () => {
    expect(participatesInThread("a_b", "a")).toBe(true);
  });

  it("returns true for a suffix participant", () => {
    expect(participatesInThread("a_b", "b")).toBe(true);
  });

  it("returns false for non-participant", () => {
    expect(participatesInThread("a_b", "c")).toBe(false);
  });

  it("avoids false positive from substring match", () => {
    expect(participatesInThread("ab_c", "abc")).toBe(false);
  });
});

describe("parseThreadParticipants", () => {
  it("parses a valid thread ID", () => {
    expect(parseThreadParticipants("a_b")).toEqual(["a", "b"]);
  });

  it("returns null when no delimiter found", () => {
    expect(parseThreadParticipants("a")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseThreadParticipants("")).toBeNull();
  });

  it("returns null when first part is empty", () => {
    expect(parseThreadParticipants("_b")).toBeNull();
  });

  it("returns null when second part is empty", () => {
    expect(parseThreadParticipants("a_")).toBeNull();
  });
});

describe("isValidThreadId", () => {
  it("returns true for valid thread ID", () => {
    expect(isValidThreadId("a_b")).toBe(true);
  });

  it("returns false when no delimiter", () => {
    expect(isValidThreadId("a")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidThreadId("")).toBe(false);
  });

  it("returns false when first part is empty", () => {
    expect(isValidThreadId("_b")).toBe(false);
  });

  it("returns false when second part is empty", () => {
    expect(isValidThreadId("a_")).toBe(false);
  });
});
