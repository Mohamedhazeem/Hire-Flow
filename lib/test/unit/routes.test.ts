import { describe, it, expect } from "vitest";
import { isHiddenRoute } from "@/lib/routes";

describe("isHiddenRoute", () => {
  it("hides auth pages", () => {
    expect(isHiddenRoute("/login")).toBe(true);
    expect(isHiddenRoute("/register")).toBe(true);
    expect(isHiddenRoute("/reset-password")).toBe(true);
    expect(isHiddenRoute("/verify-email")).toBe(true);
  });

  it("hides admin routes", () => {
    expect(isHiddenRoute("/admin")).toBe(true);
    expect(isHiddenRoute("/admin/users")).toBe(true);
  });

  it("hides recruiter routes", () => {
    expect(isHiddenRoute("/recruiter")).toBe(true);
    expect(isHiddenRoute("/recruiter/jobs")).toBe(true);
  });

  it("hides user routes", () => {
    expect(isHiddenRoute("/user")).toBe(true);
    expect(isHiddenRoute("/user/messages")).toBe(true);
  });

  it("hides invite pages", () => {
    expect(isHiddenRoute("/admin-invite/some-token")).toBe(true);
    expect(isHiddenRoute("/recruiter-invite/some-token")).toBe(true);
  });

  it("shows public home page", () => {
    expect(isHiddenRoute("/")).toBe(false);
  });

  it("shows /jobs and /jobs/* sub-routes", () => {
    expect(isHiddenRoute("/jobs")).toBe(false);
    expect(isHiddenRoute("/jobs/123")).toBe(false);
  });

  it("shows public content paths", () => {
    expect(isHiddenRoute("/privacy")).toBe(false);
    expect(isHiddenRoute("/terms")).toBe(false);
    expect(isHiddenRoute("/unauthorized")).toBe(false);
    expect(isHiddenRoute("/employers")).toBe(false);
    expect(isHiddenRoute("/pricing")).toBe(false);
    expect(isHiddenRoute("/about")).toBe(false);
    expect(isHiddenRoute("/careers")).toBe(false);
    expect(isHiddenRoute("/contact")).toBe(false);
    expect(isHiddenRoute("/press")).toBe(false);
  });

  it("shows unknown routes that are not matched by any hidden prefix", () => {
    expect(isHiddenRoute("/some-random-path")).toBe(false);
  });
});
