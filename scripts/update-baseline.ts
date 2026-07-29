// Create baseline.json if missing
// Update meanMs values from latest results
// Safely handle race conditions on concurrent pushes

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

interface BenchmarkResult {
  suite: string;
  meanMs: number;
}

const baselinePath = join("benchmark", "baseline.json");

function readBaseline() {
  if (!existsSync(baselinePath)) {
    return {
      updatedAt: new Date().toISOString(),
      suites: {},
    };
  }
  return JSON.parse(readFileSync(baselinePath, "utf-8"));
}

function updateBaseline(results: BenchmarkResult[]): void {
  const baseline = readBaseline();

  results.forEach((result) => {
    if (!baseline.suites[result.suite]) {
      baseline.suites[result.suite] = { meanMs: result.meanMs };
    } else {
      // Only update if new value is better (lower meanMs)
      if (result.meanMs < baseline.suites[result.suite].meanMs) {
        baseline.suites[result.suite].meanMs = result.meanMs;
      }
    }
  });

  baseline.updatedAt = new Date().toISOString();
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
}

const resultsSha = process.env.GITHUB_SHA || process.env.CI_SHA;
if (!resultsSha) {
  console.error("Missing GitHub/CI SHA");
  process.exit(1);
}

try {
  // Read results
  const resultsPath = join("benchmark", "results", `${resultsSha}.json`);
  const resultsJson = readFileSync(resultsPath, "utf-8");
  const results = JSON.parse(resultsJson).map((r: BenchmarkResult) => ({
    suite: r.suite,
    meanMs: r.meanMs,
  }));

  // Update baseline
  updateBaseline(results);

  // Commit if on master branch
  if (process.env.GITHUB_REF === "refs/heads/master") {
    const gitCmd = [
      'git config user.name "CI Bot"',
      'git config user.email "ci@hire-flow.ai"',
      "git add benchmark/baseline.json",
      'git commit -m "chore: update benchmark baseline [skip ci]"',
      "git pull --rebase || true",
      'git push || (console.log("Baseline update skipped due to conflict"); process.exit(0))',
    ].join(" && ");

    execSync(gitCmd, { stdio: "inherit" });
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Baseline update failed:", message);
  process.exit(1);
}
