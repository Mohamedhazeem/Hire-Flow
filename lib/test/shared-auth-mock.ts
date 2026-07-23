import { vi } from "vitest";

export const mockGetSession = vi.fn();
export const mockRevokeUserSessions = vi.fn().mockResolvedValue({ success: true });
export const mockRemoveUser = vi.fn();

vi.mock("@/app/features/auth/libs/auth", () => ({
  getSession: mockGetSession,
  auth: {
    api: {
      getSession: mockGetSession,
      adminUpdateUser: vi.fn(),
      removeUser: mockRemoveUser,
      revokeUserSessions: mockRevokeUserSessions,
    },
  },
}));
