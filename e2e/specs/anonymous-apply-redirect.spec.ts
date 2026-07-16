import { test, expect } from "@playwright/test";
import { JOBS } from "../fixtures/accounts";

test.describe("Journey 1: Anonymous Apply Redirect", () => {
  test("anonymous user sees Log in to Apply link with correct returnUrl", async ({ page }) => {
    test.skip(test.info().project.name !== "anonymous", "only meaningful for anonymous project");

    await page.goto(`/jobs/${JOBS.acme_senior_engineer}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: "Log in to Apply" })).toBeVisible({ timeout: 20_000 });

    const href = await page.getByRole("link", { name: "Log in to Apply" }).getAttribute("href");
    expect(href).toContain("/login");
    expect(href).toContain("returnUrl");
    expect(href).toContain(encodeURIComponent(`/jobs/${JOBS.acme_senior_engineer}`));
  });

  test("anonymous user is redirected to /login when clicking Log in to Apply", async ({ page }) => {
    test.skip(test.info().project.name !== "anonymous", "only meaningful for anonymous project");

    await page.goto(`/jobs/${JOBS.acme_senior_engineer}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: "Log in to Apply" })).toBeVisible({ timeout: 20_000 });

    await page.getByRole("link", { name: "Log in to Apply" }).click();
    await page.waitForURL(/\/login/, { timeout: 20_000 });
    expect(page.url()).toContain("/login");
  });
});
