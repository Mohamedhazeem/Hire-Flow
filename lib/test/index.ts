/**
 * Test infrastructure barrel — single import point for all test helpers.
 *
 * Usage in test files:
 *   import { createTestUser, resetDb, mockSession, mockPusherTrigger } from "@/lib/test";
 *
 * Note: `testDb` is intentionally NOT exported from here.
 * Tests should interact with the database only through factories and resetDb,
 * never through the raw Prisma client.
 */
export * from "./factories";
export { resetDb } from "./reset-db";
export { mockSession } from "./auth-fixtures";
export type { MockSession, MockSessionUser, MockSessionData } from "./auth-fixtures";
export { mockPusherTrigger, mockAiClient, mockResend } from "./mocks";
