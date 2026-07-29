export interface BenchmarkResult {
  suite: string;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  sampleCount: number;
}

const publishedResults: BenchmarkResult[] = [];

export function publishBenchmark(result: BenchmarkResult): void {
  publishedResults.push(result);
}

/** Called after all tests in a file — writes results to a SHA-keyed JSON file. */
export async function writeBenchmarkResults(sha: string): Promise<void> {
  if (publishedResults.length === 0) return;
  const fs = await import("node:fs");
  const path = await import("node:path");
  const dir = path.resolve("benchmark/results");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, `${sha}.json`), JSON.stringify(publishedResults, null, 2));
}

export async function measure<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now();
  const result = await fn();
  const ms = performance.now() - start;
  return { result, ms };
}

export function assertWithin(ms: number, budget: number, label?: string): void {
  if (ms > budget) {
    throw new Error(
      `${label ?? "Performance check"} took ${ms.toFixed(1)}ms, exceeded budget of ${budget}ms`,
    );
  }
}

export async function assertMemoryWithin(
  fn: () => Promise<unknown>,
  maxRSSDeltaMB: number,
): Promise<void> {
  const before = process.memoryUsage();
  await fn();
  const after = process.memoryUsage();
  const deltaMB = (after.rss - before.rss) / 1024 / 1024;
  if (deltaMB > maxRSSDeltaMB) {
    throw new Error(`Memory delta ${deltaMB.toFixed(1)}MB exceeded budget of ${maxRSSDeltaMB}MB`);
  }
}
