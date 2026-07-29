import { test, expect } from "@playwright/test";
import { ACCOUNTS } from "../fixtures/accounts";

test.describe("Journey 7: AI Resume Enhance", () => {
  test("user can navigate to resume builder", async ({ page }) => {
    test.skip(
      test.info().project.name !== "user",
      "only runs for user project with auth storageState",
    );

    const resumeId = ACCOUNTS.user.resumeIds[0];
    await page.goto(`/user/resumes/builder/${resumeId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toBeVisible({ timeout: 10_000 });
  });
});
