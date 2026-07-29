import { describe, it, expect } from "vitest";

describe("ipHash", () => {
  it("produces a deterministic hash for the same input", async () => {
    const { ipHash } = await import("@/lib/rate-limiting/ip-hash");
    const hash1 = ipHash("192.168.1.1", "salt123", 16);
    const hash2 = ipHash("192.168.1.1", "salt123", 16);
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different IPs", async () => {
    const { ipHash } = await import("@/lib/rate-limiting/ip-hash");
    const hash1 = ipHash("192.168.1.1", "salt123", 16);
    const hash2 = ipHash("10.0.0.1", "salt123", 16);
    expect(hash1).not.toBe(hash2);
  });

  it("produces different hashes for different salts", async () => {
    const { ipHash } = await import("@/lib/rate-limiting/ip-hash");
    const hash1 = ipHash("192.168.1.1", "salt1", 16);
    const hash2 = ipHash("192.168.1.1", "salt2", 16);
    expect(hash1).not.toBe(hash2);
  });

  it("respects digest length", async () => {
    const { ipHash } = await import("@/lib/rate-limiting/ip-hash");
    const hash = ipHash("192.168.1.1", "salt", 8);
    expect(hash.length).toBe(8);
  });

  it("IPHasherImpl uses configured salt and length", async () => {
    const { IPHasherImpl } = await import("@/lib/rate-limiting/ip-hash");
    const hasher = new IPHasherImpl("my-salt", 12);
    const hash1 = hasher.hash("10.0.0.1");
    const hash2 = hasher.hash("10.0.0.1");
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(12);
  });
});
