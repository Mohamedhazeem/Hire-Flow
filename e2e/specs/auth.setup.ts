import { test as setup } from "@playwright/test";
import { ACCOUNTS, JOBS } from "../fixtures/accounts";
import fs from "fs";
import path from "path";

const AUTH_DIR = path.resolve(__dirname, "../.auth");

// Wipe stale storage state files before any setup runs.
// Playwright loads storageState at context creation — stale files
// from a previous run would supply an invalid session (DB was reseeded).
fs.rmSync(AUTH_DIR, { recursive: true, force: true });
fs.mkdirSync(AUTH_DIR, { recursive: true });

setup("authenticate as admin", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(ACCOUNTS.admin.email);
  await page.getByPlaceholder("•••••••").fill(ACCOUNTS.admin.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/admin/);
  await context.storageState({ path: path.join(AUTH_DIR, "admin.json") });
});

setup("authenticate as recruiter", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(ACCOUNTS.recruiter.email);
  await page.getByPlaceholder("•••••••").fill(ACCOUNTS.recruiter.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/recruiter/);
  // Warm up nested recruiter routes to avoid cold-compile 404s in dev mode
  try {
    await page.request.get(`/recruiter/jobs/${JOBS.acme_senior_engineer}/applicants`);
  } catch {
    // non-fatal warmup
  }
  await context.storageState({ path: path.join(AUTH_DIR, "recruiter.json") });
});

setup("authenticate as user", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(ACCOUNTS.user.email);
  await page.getByPlaceholder("•••••••").fill(ACCOUNTS.user.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/jobs/);
  await context.storageState({ path: path.join(AUTH_DIR, "user.json") });
});
