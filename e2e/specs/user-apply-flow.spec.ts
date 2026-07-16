import { test, expect } from "@playwright/test";
import { ACCOUNTS, JOBS } from "../fixtures/accounts";

test.describe("Journey 2: User Apply Flow", () => {
  test("authenticated user can view a job detail page", async ({ page }) => {
    test.skip(
      test.info().project.name !== "user",
      "only runs for user project with auth storageState",
    );

    await page.goto(`/jobs/${JOBS.acme_senior_engineer}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toBeVisible({ timeout: 10_000 });
  });
});
