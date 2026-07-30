import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import dotenv from "dotenv";
import path from "path";
import { reloadEnv } from "@/utils/env";

// cmdk uses ResizeObserver + scrollIntoView internally — polyfill for jsdom
if (typeof ResizeObserver === "undefined") {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverMock;
}
if (typeof Element !== "undefined" && typeof Element.prototype.scrollIntoView !== "function") {
  (Element.prototype as unknown as Record<string, unknown>).scrollIntoView = function () {};
}

// Cleanup DOM after each test — prevents cross-file jsdom leaks in singleFork mode
afterEach(() => {
  cleanup();
});

// In CI, DATABASE_URL is set by the workflow — don't let .env.test clobber it.
if (!process.env.CI) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: true });
}

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  reloadEnv();
}

// ── Next.js headers / cookies ──────────────────────────────────────────────
// Server Actions call headers() and cookies() — these don't exist in the test
// environment, so we replace them with safe no-op stubs.
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// ── Better Auth client ─────────────────────────────────────────────────────
// Prevents component tests from hitting the real auth server.
// Per-test session control uses mockSession() from lib/test/auth-fixtures.ts.
vi.mock("@/app/features/auth/libs/auth-client", () => ({
  authClient: {
    useSession: vi.fn(() => ({ data: null, isPending: false })),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  useSession: vi.fn(() => ({ data: null, isPending: false })),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

// ── Pusher ─────────────────────────────────────────────────────────────────
// Prevents real WebSocket connections. Per-test spying uses mockPusherTrigger()
// from lib/test/mocks.ts.
vi.mock("@/lib/pusher/pusher", () => ({
  pusher: {
    trigger: vi.fn().mockResolvedValue({}),
  },
}));

// ── next/cache (revalidatePath / revalidateTag) ────────────────────────────
// Server Actions call revalidatePath() which throws in test environment.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

// ── Resend ─────────────────────────────────────────────────────────────────
// Prevents real emails from being sent. Per-test spying uses mockResend()
// from lib/test/mocks.ts.
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "mock-email-id" }, error: null }),
    },
  })),
}));
