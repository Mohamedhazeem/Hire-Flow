export function computeThreadId(idA: string, idB: string): string {
  const sorted = [idA, idB].sort();
  return `${sorted[0]}_${sorted[1]}`;
}
