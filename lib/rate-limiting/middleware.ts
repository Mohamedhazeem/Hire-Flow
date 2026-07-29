import { NextRequest, NextResponse } from "next/server";
import { rateLimitConfig, type RateLimitEndpoint } from "./config";
import {
  countRateLimitDecision,
  recordCheckDuration,
  recordDbLatency,
  startCheckSpan,
  endCheckSpan,
  recordSpanError,
} from "./metrics";
import { runWithTraceContext, generateRequestId } from "./telemetry";
import { runWithSessionCache } from "./request-context";
import { getSession } from "@/app/features/auth/libs/auth";
import { ipHash } from "./ip-hash";
import type { RateLimiter, RateLimitResult } from "./types";

type RouteContext = { params: Promise<unknown> };
type Handler = (request: NextRequest, context: RouteContext) => Promise<NextResponse>;

function getEffectiveMax(role: string, baseMax: number): number {
  const roleCfg = rateLimitConfig.roles[role as keyof typeof rateLimitConfig.roles] ?? rateLimitConfig.roles.anonymous;
  return Math.round(baseMax * roleCfg.multiplier);
}

function getActorKey(session: { id: string } | null, ip: string, role: string): string {
  if (session) {
    if (role === "anonymous") {
      return `anon:${ipHash(ip, process.env[rateLimitConfig.ipHashing.saltEnvVar] ?? "", rateLimitConfig.ipHashing.digestLength)}`;
    }
    return session.id;
  }
  return `anon:${ipHash(ip, process.env[rateLimitConfig.ipHashing.saltEnvVar] ?? "", rateLimitConfig.ipHashing.digestLength)}`;
}

function extractIP(request: NextRequest): string {
  if (rateLimitConfig.proxy.trusted) {
    const forwarded = request.headers.get(rateLimitConfig.proxy.trustedHeader);
    if (forwarded) {
      if (rateLimitConfig.proxy.trustedHeader === "x-forwarded-for") {
        return forwarded.split(",")[0].trim();
      }
      return forwarded;
    }
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

function buildServiceUnavailableResponse(statusCode: number): NextResponse {
  return NextResponse.json(
    { success: false, error: "Service temporarily unavailable. Please try again." },
    { status: statusCode },
  );
}

export function createWithRateLimit(rateLimiter: RateLimiter) {
  return function withRateLimit(handler: Handler, endpointKey: RateLimitEndpoint) {
    return async (request: NextRequest, context?: RouteContext): Promise<NextResponse> => {
      const requestId = generateRequestId();

      const session = await getSession();
      const user = session?.user as { id: string; name: string; email: string; role?: string } | undefined;
      const role = user?.role ?? "anonymous";

      const baseSession = {
        id: user?.id ?? "",
        name: user?.name ?? "",
        email: user?.email ?? "",
        role,
      };

      const runHandler = () => runWithTraceContext({ requestId }, () => handler(request, context!));

      return runWithSessionCache({ session: { ...baseSession } }, async () => {
        if (!rateLimitConfig.enabled) {
          return runHandler();
        }

        const ip = extractIP(request);
        const actorKey = getActorKey(session ? { id: user!.id } : null, ip, role);
        const endpointCfg = rateLimitConfig.endpoints[endpointKey] ?? rateLimitConfig.default;
        const effectiveMax = getEffectiveMax(role, endpointCfg.max);
        const dbKey = `app:${endpointKey}:${actorKey}`;

        const failStrategy =
          (endpointCfg as { failStrategy?: "open" | "closed" }).failStrategy ?? rateLimitConfig.failStrategy.default;

        const start = performance.now();
        let result: RateLimitResult;
        try {
          const span = startCheckSpan(dbKey, effectiveMax);
          result = await rateLimiter.check(dbKey, effectiveMax, endpointCfg.windowMs);
          const durationMs = Math.round(performance.now() - start);
          endCheckSpan(span, result.allowed, durationMs);
          recordCheckDuration(durationMs, endpointKey);
          recordDbLatency(durationMs);
        } catch (err) {
          const durationMs = Math.round(performance.now() - start);
          recordCheckDuration(durationMs, endpointKey);
          recordDbLatency(durationMs);
          countRateLimitDecision({ endpoint: endpointKey, role, decision: "db_failure" });

          if (err instanceof Error) {
            const span = startCheckSpan(dbKey, effectiveMax);
            recordSpanError(span, err);
          }

          if (failStrategy === "closed") {
            return buildServiceUnavailableResponse(rateLimitConfig.failStrategy.statusCode);
          }
          return runHandler();
        }

        const decision = result.allowed ? "allowed" : "blocked";
        countRateLimitDecision({ endpoint: endpointKey, role, decision });

        if (!result.allowed && !rateLimitConfig.shadowMode) {
          const res = NextResponse.json(
            { success: false, error: "Too many requests. Please try again later." },
            {
              status: 429,
              headers: {
                "Retry-After": String(result.retryAfter),
                "X-RateLimit-Limit": String(result.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": String(result.reset),
              },
            },
          );
          return res;
        }

        const response = await runHandler();

        if (response && "headers" in response) {
          response.headers.set("X-RateLimit-Limit", String(result.limit));
          response.headers.set("X-RateLimit-Remaining", String(result.remaining));
          response.headers.set("X-RateLimit-Reset", String(result.reset));
        }

        return response;
      });
    };
  };
}
