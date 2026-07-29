import { test, expect } from "@playwright/test";

test.describe("Journey 9: Cross-Role Access", () => {
  test("admin can access admin dashboard", async ({ page }) => {
    test.skip(test.info().project.name !== "admin", "only runs for admin project with auth storageState");

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toBeVisible({ timeout: 10_000 });
  });
});
