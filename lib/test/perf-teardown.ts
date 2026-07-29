import { writeBenchmarkResults } from "./perf";

export async function globalTeardown(): Promise<void> {
  const sha = process.env.GITHUB_SHA ?? process.env.CI_SHA;

  if (sha) {
    await writeBenchmarkResults(sha);
  } else {
    console.warn(
      "[perf-teardown] No SHA found (GITHUB_SHA/CI_SHA), skipping benchmark result write",
    );
  }
}
