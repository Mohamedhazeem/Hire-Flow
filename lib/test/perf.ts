export async function measure<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now();
  const result = await fn();
  const ms = performance.now() - start;
  return { result, ms };
}

export function assertWithin(ms: number, budget: number, label?: string): void {
  if (ms > budget) {
    throw new Error(`${label ?? "Performance check"} took ${ms.toFixed(1)}ms, exceeded budget of ${budget}ms`);
  }
}

export async function assertMemoryWithin(fn: () => Promise<unknown>, maxRSSDeltaMB: number): Promise<void> {
  const before = process.memoryUsage();
  await fn();
  const after = process.memoryUsage();
  const deltaMB = (after.rss - before.rss) / 1024 / 1024;
  if (deltaMB > maxRSSDeltaMB) {
    throw new Error(`Memory delta ${deltaMB.toFixed(1)}MB exceeded budget of ${maxRSSDeltaMB}MB`);
  }
}
