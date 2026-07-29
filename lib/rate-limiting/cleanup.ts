import { rateLimiter } from "./di";
import { rateLimitConfig } from "./config";
import { setActiveKeyCount } from "./metrics";
import { prisma } from "@/lib/prisma";

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startCleanup(): void {
  if (!rateLimitConfig.cleanup.enabled) return;
  if (cleanupTimer) return;

  cleanupTimer = setInterval(async () => {
    try {
      await rateLimiter.prune();

      const count = await prisma.rateLimit.count({
        where: { OR: [{ id: { startsWith: "app:" } }, { id: { startsWith: "anon:" } }] },
      });
      setActiveKeyCount(count);
    } catch (err) {
      console.error("[rate-limit] cleanup failed:", err);
    }
  }, rateLimitConfig.cleanup.intervalMs);

  cleanupTimer.unref();
}

export function stopCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
