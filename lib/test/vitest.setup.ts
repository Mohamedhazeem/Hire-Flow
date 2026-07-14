/**
 * Vitest setupFiles — runs in EVERY worker process before each test file.
 *
 * Responsibilities:
 *  1. Augment Jest DOM matchers (toBeInTheDocument, toHaveValue, etc.).
 *  2. Re-load `.env.test` — workers are separate Node processes and don't
 *     inherit the main process environment automatically.
 *  3. Remap DATABASE_URL_TEST → DATABASE_URL so the Prisma client in workers
 *     targets the test database.
 *  4. Install global module mocks for Next.js APIs and external services so
 *     no test file ever hits real infrastructure by accident.
 */
import "@testing-library/jest-dom";
import { vi } from "vitest";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
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
