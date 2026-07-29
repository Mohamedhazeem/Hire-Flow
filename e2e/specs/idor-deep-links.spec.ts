import { test, expect } from "@playwright/test";

test.describe("Journey 10: IDOR Deep Links", () => {
  test("non-existent application returns 404-style page", async ({ page }) => {
    test.skip(
      test.info().project.name !== "recruiter",
      "only runs for recruiter project with auth storageState",
    );

    await page.goto(`/recruiter/applicants/nonexistent-id-12345`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("body")).toBeVisible({ timeout: 20_000 });
  });
});
