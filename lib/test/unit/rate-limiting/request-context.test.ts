import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSessionCache,
  runWithSessionCache,
  setCachedSession,
  type SessionCache,
} from "@/lib/rate-limiting/request-context";

describe("request-context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSessionCache returns null when no context is set", async () => {
    expect(getSessionCache()).toBeNull();
  });

  it("runWithSessionCache sets and retrieves session in AsyncLocalStorage", async () => {
    const session = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    };

    let captured: SessionCache | null = null;

    await runWithSessionCache({ session }, async () => {
      captured = getSessionCache();
    });

    expect(captured).not.toBeNull();
    expect((captured as SessionCache | null)?.session).toEqual(session);
  });

  it("runWithSessionCache isolates context between calls", async () => {
    const session1 = { id: "user-1", name: "User 1", email: "user1@test.com", role: "user" };
    const session2 = { id: "user-2", name: "User 2", email: "user2@test.com", role: "recruiter" };

    let captured1: SessionCache | null = null;
    let captured2: SessionCache | null = null;

    await runWithSessionCache({ session: session1 }, async () => {
      captured1 = getSessionCache();
      await runWithSessionCache({ session: session2 }, async () => {
        captured2 = getSessionCache();
      });
    });

    expect((captured1 as SessionCache | null)?.session).toEqual(session1);
    expect((captured2 as SessionCache | null)?.session).toEqual(session2);
  });

  it("runWithSessionCache restores previous context after nested call", async () => {
    const session1 = { id: "user-1", name: "User 1", email: "user1@test.com", role: "user" };
    const session2 = { id: "user-2", name: "User 2", email: "user2@test.com", role: "recruiter" };

    let outerContext: SessionCache | null = null;
    let innerContext: SessionCache | null = null;
    let afterInnerContext: SessionCache | null = null;

    await runWithSessionCache({ session: session1 }, async () => {
      outerContext = getSessionCache();
      await runWithSessionCache({ session: session2 }, async () => {
        innerContext = getSessionCache();
      });
      afterInnerContext = getSessionCache();
    });

    expect((outerContext as SessionCache | null)?.session).toEqual(session1);
    expect((innerContext as SessionCache | null)?.session).toEqual(session2);
    expect((afterInnerContext as SessionCache | null)?.session).toEqual(session1);
  });

  it("runWithSessionCache handles null session", async () => {
    let captured: SessionCache | null = null;

    await runWithSessionCache({ session: null }, async () => {
      captured = getSessionCache();
    });

    expect(captured).not.toBeNull();
    expect((captured as SessionCache | null)?.session).toBeNull();
  });

  it("setCachedSession updates session in current context", async () => {
    const session1 = { id: "user-1", name: "User 1", email: "user1@test.com", role: "user" };
    const session2 = { id: "user-2", name: "User 2", email: "user2@test.com", role: "recruiter" };

    let captured: SessionCache | null = null;

    await runWithSessionCache({ session: session1 }, async () => {
      setCachedSession(session2);
      captured = getSessionCache();
    });

    expect((captured as SessionCache | null)?.session).toEqual(session2);
  });

  it("setCachedSession does nothing when no context exists", async () => {
    setCachedSession({ id: "user-1", name: "User", email: "test@test.com", role: "user" });
    expect(getSessionCache()).toBeNull();
  });
});
