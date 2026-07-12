/**
 * Auth fixtures — pure in-memory, no database calls.
 *
 * `mockSession` produces the exact shape that Better Auth's `getSession()` returns.
 * Use it to inject a fake session when testing Server Actions or API routes
 * that call `requireRole`.
 *
 * Usage:
 *   vi.mocked(getSession).mockResolvedValue(mockSession("admin", { id: "user-1" }));
 */

export interface MockSessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpiresAt: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSessionData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSession {
  session: MockSessionData;
  user: MockSessionUser;
}

/**
 * Generates a mock Better Auth session object.
 *
 * @param role - The user's role ("user" | "recruiter" | "admin" | "super_admin")
 * @param overrides - Optional field overrides applied to the user object.
 *                    Spread last, so any override wins over defaults.
 */
export function mockSession(
  role: string,
  overrides?: Partial<MockSessionUser>
): MockSession {
  const userId = overrides?.id ?? "mock-user-id";

  return {
    session: {
      id: "mock-session-id",
      userId,
      token: "mock-session-token",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      ipAddress: "127.0.0.1",
      userAgent: "Vitest Test Runner",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    user: {
      id: userId,
      name: overrides?.name ?? "Test User",
      email: overrides?.email ?? `test-${role}@example.com`,
      emailVerified: overrides?.emailVerified ?? true,
      role,
      banned: overrides?.banned ?? false,
      banReason: overrides?.banReason ?? null,
      banExpiresAt: overrides?.banExpiresAt ?? null,
      image: overrides?.image ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    },
  };
}
