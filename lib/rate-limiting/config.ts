import type { CleanupConfig, EndpointLimit, FailStrategyConfig } from "./types";

export const rateLimitConfig = {
  enabled: true,
  shadowMode: false,
  strategy: "prisma" as const,

  failStrategy: {
    default: "open" as "open" | "closed",
    statusCode: 503,
  } satisfies FailStrategyConfig,

  proxy: {
    trusted: false,
    trustedHeader: "x-real-ip" as "x-real-ip" | "x-forwarded-for" | "cf-connecting-ip",
  },

  ipHashing: {
    enabled: true,
    saltEnvVar: "RATE_LIMIT_IP_SALT",
    digestLength: 16,
  },

  cleanup: {
    enabled: true,
    intervalMs: 86_400_000,
    retentionMs: 86_400_000,
    batchSize: 5_000,
    budgetMs: 30_000,
  } satisfies CleanupConfig,

  default: { max: 20, windowMs: 60_000, failStrategy: undefined } as EndpointLimit,

  roles: {
    anonymous: { multiplier: 0.3 },
    user: { multiplier: 1 },
    recruiter: { multiplier: 2 },
    admin: { multiplier: 5 },
    super_admin: { multiplier: 10 },
  },

  endpoints: {
    "jobs:view": { max: 100, windowMs: 60_000 },
    "jobs:apply": { max: 10, windowMs: 60_000, failStrategy: "open" },
    "messages:send": { max: 200, windowMs: 3_600_000 },
    "resumes:ai-enhance": { max: 5, windowMs: 86_400_000 },
    "messages:list": { max: 60, windowMs: 60_000 },
    "messages:delete": { max: 30, windowMs: 60_000 },
    "notifications:list": { max: 60, windowMs: 60_000 },
    "profile:read": { max: 60, windowMs: 60_000 },
    "profile:update": { max: 10, windowMs: 60_000 },
    "resumes:list": { max: 30, windowMs: 60_000 },
    "resumes:upload": { max: 10, windowMs: 60_000 },
    "applications:list": { max: 30, windowMs: 60_000 },
    "bookmarks:list": { max: 30, windowMs: 60_000 },
    "bookmarks:toggle": { max: 20, windowMs: 60_000 },
  } satisfies Record<string, EndpointLimit>,
};

export type RateLimitEndpoint = keyof typeof rateLimitConfig.endpoints;

export function validateConfig(): void {
  const {
    endpoints,
    roles,
    default: def,
    strategy,
    proxy,
    ipHashing,
    cleanup,
    failStrategy,
    shadowMode,
    enabled,
  } = rateLimitConfig;

  if (typeof enabled !== "boolean") throw new Error("enabled must be a boolean");
  if (typeof shadowMode !== "boolean") throw new Error("shadowMode must be a boolean");

  const VALID_STRATEGIES = new Set(["prisma", "redis", "memory"]);
  if (!VALID_STRATEGIES.has(strategy)) {
    throw new Error(`strategy "${strategy}" must be one of: ${[...VALID_STRATEGIES].join(", ")}`);
  }

  if (typeof proxy.trusted !== "boolean") throw new Error("proxy.trusted must be a boolean");
  const VALID_HEADERS = new Set(["x-real-ip", "x-forwarded-for", "cf-connecting-ip"]);
  if (!VALID_HEADERS.has(proxy.trustedHeader)) {
    throw new Error(`trustedHeader "${proxy.trustedHeader}" must be one of: ${[...VALID_HEADERS].join(", ")}`);
  }

  if (typeof ipHashing.enabled !== "boolean") throw new Error("ipHashing.enabled must be a boolean");
  if (ipHashing.digestLength < 8 || ipHashing.digestLength > 64 || !Number.isInteger(ipHashing.digestLength)) {
    throw new Error(`ipHashing.digestLength must be an integer between 8 and 64, got ${ipHashing.digestLength}`);
  }
  const salt = process.env[ipHashing.saltEnvVar];
  if (ipHashing.enabled && process.env.NODE_ENV === "production" && !salt) {
    throw new Error(`ipHashing requires ${ipHashing.saltEnvVar} env var in production`);
  }

  if (typeof cleanup.enabled !== "boolean") throw new Error("cleanup.enabled must be a boolean");
  for (const key of ["intervalMs", "retentionMs", "batchSize", "budgetMs"] as const) {
    if (!Number.isFinite(cleanup[key]) || cleanup[key] <= 0) {
      throw new Error(`cleanup.${key} must be > 0, got ${cleanup[key]}`);
    }
  }
  if (cleanup.batchSize < 100 || cleanup.batchSize > 100_000) {
    throw new Error(`cleanup.batchSize must be between 100 and 100,000, got ${cleanup.batchSize}`);
  }

  if (!["open", "closed"].includes(failStrategy.default)) {
    throw new Error('failStrategy.default must be "open" or "closed"');
  }
  if (!Number.isInteger(failStrategy.statusCode) || failStrategy.statusCode < 400 || failStrategy.statusCode > 599) {
    throw new Error("failStrategy.statusCode must be an integer between 400 and 599");
  }

  if (def.max <= 0 || def.windowMs <= 0) throw new Error("default limit or windowMs must be > 0");
  if (def.failStrategy && !["open", "closed"].includes(def.failStrategy)) {
    throw new Error('default.failStrategy must be "open", "closed", or undefined');
  }

  for (const [role, cfg] of Object.entries(roles)) {
    if (cfg.multiplier <= 0) throw new Error(`role "${role}" multiplier must be > 0`);
    if (!Number.isFinite(cfg.multiplier)) throw new Error(`role "${role}" multiplier must be finite`);
  }

  for (const [key, ep] of Object.entries(endpoints)) {
    if (ep.max <= 0) throw new Error(`endpoint "${key}" max must be > 0`);
    if (ep.windowMs <= 0) throw new Error(`endpoint "${key}" windowMs must be > 0`);
    const epFailStrategy = (ep as EndpointLimit).failStrategy;
    if (epFailStrategy && !["open", "closed"].includes(epFailStrategy as string)) {
      throw new Error(`endpoint "${key}" failStrategy must be "open", "closed", or undefined`);
    }
    const minMult = Math.min(...Object.values(roles).map((r) => r.multiplier));
    if (Math.round(ep.max * minMult) < 1) {
      throw new Error(`endpoint "${key}" produces effectiveMax < 1 with multiplier ${minMult}`);
    }
  }

  if (shadowMode && (strategy as string) === "memory") {
    throw new Error("shadowMode is not supported with memory strategy");
  }
  if (proxy.trusted && process.env.NODE_ENV === "production" && !process.env.RATE_LIMIT_TRUSTED_PROXY) {
    console.warn(
      "proxy.trusted is true but RATE_LIMIT_TRUSTED_PROXY env var is not set. Ensure you are behind a trusted proxy.",
    );
  }
}

export function freezeConfig(): void {
  Object.freeze(rateLimitConfig);
  Object.freeze(rateLimitConfig.roles);
  Object.freeze(rateLimitConfig.endpoints);
  Object.freeze(rateLimitConfig.proxy);
  Object.freeze(rateLimitConfig.ipHashing);
  Object.freeze(rateLimitConfig.cleanup);
  Object.freeze(rateLimitConfig.failStrategy);
  for (const ep of Object.values(rateLimitConfig.endpoints)) Object.freeze(ep);
  for (const role of Object.values(rateLimitConfig.roles)) Object.freeze(role);
}
