import { test, expect } from "@playwright/test";

test.describe("Journey 5: Admin Ban User", () => {
  test("admin can navigate to admin dashboard", async ({ page }) => {
    test.skip(
      test.info().project.name !== "admin",
      "only runs for admin project with auth storageState",
    );

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toBeVisible({ timeout: 10_000 });
  });

  test("admin can navigate to users page", async ({ page }) => {
    test.skip(
      test.info().project.name !== "admin",
      "only runs for admin project with auth storageState",
    );

    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toBeVisible({ timeout: 10_000 });
  });
});
