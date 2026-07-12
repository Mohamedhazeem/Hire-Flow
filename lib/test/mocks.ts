/**
 * External service mocks — per-test spy helpers.
 *
 * These differ from the global vi.mock() calls in vitest.setup.ts:
 *  - vitest.setup.ts replaces modules globally (passive — stops real calls)
 *  - This file provides spy functions you call inside beforeEach / it blocks
 *    so you can assert HOW MANY TIMES and WITH WHAT ARGS services were called.
 *
 * Usage:
 *   const emailSpy = mockResend();
 *   await someAction();
 *   expect(emailSpy).toHaveBeenCalledWith(expect.objectContaining({ to: "..." }));
 */
import { vi } from "vitest";
import { pusher } from "@/lib/pusher/pusher";
import * as aiClient from "@/lib/ai-client";
import * as emailModule from "@/app/features/auth/libs/email";

/**
 * Spies on `pusher.trigger` and resolves successfully.
 * Returns the spy so tests can assert call count and arguments.
 */
export function mockPusherTrigger() {
  const mockTrigger = vi.fn().mockResolvedValue({});
  vi.spyOn(pusher, "trigger").mockImplementation(mockTrigger as never);
  return mockTrigger;
}

/**
 * Spies on `callAI` and resolves with the provided response.
 *
 * @param response - The value `callAI` should resolve with (string | null).
 *                   Pass `null` to simulate a missing API key / fallback.
 */
export function mockAiClient(response: string | null) {
  return vi.spyOn(aiClient, "callAI").mockResolvedValue(response);
}

/**
 * Spies on `sendEmail` and resolves successfully without executing the real
 * mail flow. Returns the inner mock so tests can assert call args.
 */
export function mockResend() {
  const mockSend = vi
    .fn()
    .mockResolvedValue({ data: { id: "mock-email-id" }, error: null });

  vi.spyOn(emailModule, "sendEmail").mockImplementation(async (args) => {
    await mockSend(args);
  });

  return mockSend;
}
