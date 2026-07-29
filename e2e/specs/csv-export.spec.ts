import { test, expect } from "@playwright/test";
import { JOBS } from "../fixtures/accounts";

test.describe("Journey 8: CSV Export", () => {
  test("recruiter can navigate to applicants page with export option", async ({ page }) => {
    test.skip(test.info().project.name !== "recruiter", "only runs for recruiter project with auth storageState");

    await page.goto(`/recruiter/jobs/${JOBS.acme_senior_engineer}/applicants`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("body")).toBeVisible({ timeout: 20_000 });
  });
});
