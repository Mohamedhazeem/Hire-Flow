import { test, expect } from "@playwright/test";
import { JOBS } from "../fixtures/accounts";

test.describe("Journey 3: Recruiter Pipeline", () => {
  test("recruiter sees applicants and can view detail", async ({ page }) => {
    test.skip(
      test.info().project.name !== "recruiter",
      "only runs for recruiter project with auth storageState",
    );

    await page.goto(`/recruiter/jobs/${JOBS.acme_senior_engineer}/applicants`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Eve Applicant/i)).toBeVisible({ timeout: 20_000 });
  });
});
