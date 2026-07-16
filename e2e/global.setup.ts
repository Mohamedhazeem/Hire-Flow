/**
 * Playwright global setup — runs once before any project's test suite.
 *
 * Responsibilities:
 *   1. Apply migrations + seed the test database.
 *   2. Start the AI mock server for Journey 7.
 *   3. Log in each role (admin, recruiter, user) via the real UI
 *      and save storageState to .auth/<role>.json.
 */
import { chromium, type FullConfig } from "@playwright/test";
import { ACCOUNTS, JOBS } from "./fixtures/accounts";
import { startAiMockServer } from "./ai-mock-server";
import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

const AUTH_DIR = path.resolve(__dirname, ".auth");

export default async function globalSetup(_config: FullConfig) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }

  const DB_URL = process.env.DATABASE_URL;
  if (!DB_URL) {
    console.warn("No DATABASE_URL — skipping DB setup for e2e tests");
    return;
  }

  // 1. Migrate + seed
  console.warn("Running migrations on e2e test DB...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } catch {
    console.warn("Migrations may already be applied; continuing...");
  }

  console.warn("Seeding e2e test DB...");
  execSync("npx tsx prisma/seed.ts", {
    stdio: "inherit",
    env: { ...process.env, ALLOW_SEED: "true" },
  });

  // 2. Start AI mock server for Journey 7
  const aiPort = Number(process.env.E2E_AI_MOCK_PORT || "8787");
  process.env.AI_PROVIDER = "anthropic";
  process.env.ANTHROPIC_API_KEY = "e2e-stub";
  process.env.ANTHROPIC_API_URL = `http://localhost:${aiPort}`;
  await startAiMockServer(aiPort);

    // 3. Login each role via Better Auth API and save storageState.
    const browser = await chromium.launch();
    const base = process.env.E2E_BASE_URL ?? "http://localhost:3000";
    const signInUrl = `${base}/api/auth/sign-in/email`;

    // Warm up the core routes so the first real test requests don't hit a
    // cold-compiling server (which can momentarily return 404).
    const warmupUrls = [
      "/",
      "/jobs",
      `/jobs/${JOBS.acme_senior_engineer}`,
      "/login",
      "/recruiter",
      "/admin",
      "/api/auth/get-session",
    ];
    const warmCtx = await browser.newContext();
    for (const u of warmupUrls) {
      try {
        await warmCtx.request.get(`${base}${u}`);
      } catch {
        /* ignore warmup errors */
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    await warmCtx.close();

    for (const [role, creds] of Object.entries(ACCOUNTS)) {
      console.warn(`Logging in as ${role}...`);

      let cookiesLen = 0;
      for (let attempt = 0; attempt < 5; attempt++) {
        const context = await browser.newContext({ baseURL: base });
        try {
          let response: Awaited<ReturnType<typeof context.request.post>> | null = null;
          for (let inner = 0; inner < 3; inner++) {
            try {
              response = await context.request.post(signInUrl, {
                data: { email: creds.email, password: creds.password },
              });
              break;
            } catch (e) {
              console.warn(`  inner attempt ${inner + 1} failed: ${e}`);
              await new Promise((r) => setTimeout(r, 1500));
            }
          }

          if (!response || !response.ok()) {
            console.warn(
              `  sign-in not ok for ${role} (attempt ${attempt + 1}): ${response?.status() ?? "no-response"}`,
            );
            await new Promise((r) => setTimeout(r, 3000));
            await context.close();
            continue;
          }

          // Landing on a protected page establishes the session cookie fully.
          const page = await context.newPage();
          const destPages: Record<string, string> = {
            admin: "/admin",
            recruiter: "/recruiter",
            recruiter2: "/recruiter",
            user: "/jobs",
            user2: "/jobs",
            user3: "/jobs",
          };
          await page.goto(destPages[role] || "/");
          await page.waitForLoadState("domcontentloaded");

          const cookies = await context.cookies();
          cookiesLen = cookies.length;
          if (cookiesLen === 0) {
            console.warn(`  no cookies for ${role} (attempt ${attempt + 1}), retrying...`);
            await new Promise((r) => setTimeout(r, 3000));
            await context.close();
            continue;
          }

          await context.storageState({ path: path.join(AUTH_DIR, `${role}.json`) });
          await context.close();
          console.warn(`  Login succeeded for ${role}`);
          break;
        } catch (err) {
          console.warn(`  Login flow for ${role} had an error (attempt ${attempt + 1}): ${err}`);
          try {
            await context.close();
          } catch {
            /* ignore */
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      }

      if (cookiesLen === 0) {
        console.warn(`  !! WARNING: could not establish session for ${role}`);
        // Still write an empty storageState so the project can at least start.
        const fallback = await browser.newContext();
        await fallback.storageState({ path: path.join(AUTH_DIR, `${role}.json`) });
        await fallback.close();
      }

      // Avoid Better Auth rate limit (max 5 / 10s on /sign-in/email)
      await new Promise((r) => setTimeout(r, 3000));
    }

  await browser.close();
  console.warn("Global setup complete: DB seeded, AI mock running, auth states saved.");
}
