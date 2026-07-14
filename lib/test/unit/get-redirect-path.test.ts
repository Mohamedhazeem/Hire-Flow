import { describe, it, expect } from "vitest";
import { getRedirectPath } from "@/app/features/auth/utils/getRedirectPath";
import type { User, UserCredentials } from "@/app/features/auth/schema/auth.type";

function makeUser(role: string): User {
  return {
    id: "user-1",
    email: "test@test.com",
    name: "Test",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
  };
}

function makeCredentials(user: User): UserCredentials {
  return { token: "tok-123", user };
}

describe("getRedirectPath", () => {
  it("redirects admin to /admin", () => {
    expect(getRedirectPath(makeUser("admin"))).toBe("/admin");
  });

  it("redirects super_admin to /admin", () => {
    expect(getRedirectPath(makeUser("super_admin"))).toBe("/admin");
  });

  it("redirects recruiter to /recruiter", () => {
    expect(getRedirectPath(makeUser("recruiter"))).toBe("/recruiter");
  });

  it("redirects user to /jobs", () => {
    expect(getRedirectPath(makeUser("user"))).toBe("/jobs");
  });

  it("redirects unknown role to /jobs (default)", () => {
    expect(getRedirectPath(makeUser("unknown"))).toBe("/jobs");
  });

  it("handles UserCredentials shape", () => {
    const creds = makeCredentials(makeUser("recruiter"));
    expect(getRedirectPath(creds)).toBe("/recruiter");
  });

  it("uses returnUrl when valid", () => {
    expect(getRedirectPath(makeUser("user"), "/custom-path")).toBe("/custom-path");
  });

  it("ignores returnUrl with protocol", () => {
    expect(getRedirectPath(makeUser("admin"), "https://evil.com")).toBe("/admin");
  });

  it("ignores returnUrl starting with //", () => {
    expect(getRedirectPath(makeUser("recruiter"), "//evil.com")).toBe("/recruiter");
  });
});
