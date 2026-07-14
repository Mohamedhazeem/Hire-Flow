import { vi } from "vitest";

export const mockGetSession = vi.fn();

vi.mock("@/app/features/auth/libs/auth", () => ({
  getSession: mockGetSession,
  auth: {
    api: {
      getSession: mockGetSession,
      adminUpdateUser: vi.fn(),
      removeUser: vi.fn(),
      revokeUserSessions: vi.fn(),
    },
  },
}));
