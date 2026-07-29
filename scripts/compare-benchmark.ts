// Reads benchmark/results/<sha>.json (determined by process.env.GITHUB_SHA) + benchmark/baseline.json
// For each suite:
// - meanMs > baseline.budgetMs → error (hard limit — code became catastrophically slower)
// - baseline.meanMs !== null && meanMs > baseline.meanMs * 1.2 → error (>20% regression)
// - Logs pass/fail for each suite
// Exit code 1 on any failure; exit 0 otherwise

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

interface BenchmarkResult {
  suite: string;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  sampleCount: number;
}

interface SuiteThreshold {
  meanMs: number | null;
  budgetMs: number;
  regressionThreshold?: number;
}

interface Baseline {
  updatedAt: string;
  suites: Record<string, SuiteThreshold>;
}

function readBaseline(): Baseline {
  const baselinePath = resolve("benchmark/baseline.json");
  if (!existsSync(baselinePath)) {
    console.error("No baseline found - creating empty baseline");
    return {
      updatedAt: new Date().toISOString(),
      suites: {},
    };
  }
  return JSON.parse(readFileSync(baselinePath, "utf-8"));
}

function readResults(sha: string): BenchmarkResult[] {
  const resultsPath = resolve(`benchmark/results/${sha}.json`);
  if (!existsSync(resultsPath)) {
    console.error(`No results found for SHA ${sha}`);
    return [];
  }
  return JSON.parse(readFileSync(resultsPath, "utf-8"));
}

function main() {
  const sha = process.env.GITHUB_SHA;
  if (!sha) {
    console.error("GITHUB_SHA environment variable not set");
    process.exit(1);
  }

  const baseline = readBaseline();
  const results = readResults(sha);

  if (results.length === 0) {
    console.error("No benchmark results found");
    process.exit(1);
  }

  let hasFailed = false;

  console.log("Comparing benchmark results against baseline...");
  console.log("");

  for (const result of results) {
    const threshold = baseline.suites[result.suite];

    if (!threshold) {
      console.log(`⚠️  Suite "${result.suite}" not found in baseline - skipping`);
      continue;
    }

    const budgetMs = threshold.budgetMs;
    const baselineMean = threshold.meanMs ?? null;
    const regressionThreshold = threshold.regressionThreshold ?? 1.2;

    // Hard limit check
    if (result.meanMs > budgetMs) {
      console.error(
        `❌ ${result.suite}: meanMs ${result.meanMs} > budgetMs ${budgetMs} (hard limit)`,
      );
      hasFailed = true;
      continue;
    }

    // Regression check
    if (baselineMean !== null && result.meanMs > baselineMean * regressionThreshold) {
      console.error(
        `❌ ${result.suite}: meanMs ${result.meanMs} > baselineMean ${baselineMean} × ${regressionThreshold} (regression)`,
      );
      hasFailed = true;
      continue;
    }

    // Pass
    console.log(
      `✅ ${result.suite}: meanMs ${result.meanMs} (budget: ${budgetMs}ms${baselineMean !== null ? `, baseline: ${baselineMean}ms` : ""})`,
    );
  }

  console.log("");
  if (hasFailed) {
    console.error("❌ Benchmark regression check failed");
    process.exit(1);
  } else {
    console.log("✅ All benchmark checks passed");
    process.exit(0);
  }
}

main();
