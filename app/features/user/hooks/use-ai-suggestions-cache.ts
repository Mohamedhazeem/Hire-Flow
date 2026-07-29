import { EnhancementsResponseSchema } from "@/app/features/user/schema/resume-ai.schema";

const CACHE_PREFIX = "ai-suggestions";
const TTL_MS = 30 * 60 * 1000;

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function cacheKey(resumeId: string, builderData: unknown): string {
  const serialized = JSON.stringify(builderData ?? {});
  return `${CACHE_PREFIX}:${resumeId}:${hash(serialized)}`;
}

function isAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = `${CACHE_PREFIX}:__test__`;
    sessionStorage.setItem(testKey, "1");
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getCachedResponse(
  resumeId: string,
  builderData: unknown,
): import("@/app/features/user/schema/resume-ai.schema").EnhancementsResponse | null {
  if (!isAvailable()) return null;
  try {
    const key = cacheKey(resumeId, builderData);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.cachedAt > TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    const result = EnhancementsResponseSchema.safeParse(parsed.response);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}

export function setCachedResponse(
  resumeId: string,
  builderData: unknown,
  response: import("@/app/features/user/schema/resume-ai.schema").EnhancementsResponse,
): void {
  if (!isAvailable()) return;
  try {
    const key = cacheKey(resumeId, builderData);
    sessionStorage.setItem(key, JSON.stringify({ response, cachedAt: Date.now() }));
  } catch {
    // silently fail if storage is full
  }
}

export function clearCachedResponse(resumeId: string): void {
  if (!isAvailable()) return;
  try {
    const prefix = `${CACHE_PREFIX}:${resumeId}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // silently fail
  }
}
