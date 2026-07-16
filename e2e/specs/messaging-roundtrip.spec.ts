import { test, expect } from "@playwright/test";

test.describe("Journey 6: Messaging Roundtrip", () => {
  test("recruiter can navigate to messages page", async ({ page }) => {
    test.skip(
      test.info().project.name !== "recruiter",
      "only runs for recruiter project with auth storageState",
    );

    await page.goto("/recruiter/messages");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toBeVisible({ timeout: 10_000 });
  });
});
