import Pusher from "pusher-js";
import { env } from "@/utils/env";

let pusherClient: Pusher | null = null;

function getPusherConfig() {
  // env.data is undefined on the client because server-only env vars like
  // DATABASE_URL fail Zod validation. Public NEXT_PUBLIC_* vars must use
  // STATIC process.env access (e.g. process.env.NEXT_PUBLIC_PUSHER_KEY) so
  // Next.js inlines them at build time — computed access via [name] is NOT
  // replaced by the compiler.
  if (typeof window !== "undefined") {
    return {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    };
  }
  return {
    key: env.data?.NEXT_PUBLIC_PUSHER_KEY,
    cluster: env.data?.NEXT_PUBLIC_PUSHER_CLUSTER,
  };
}

export function getPusherClient(): Pusher | null {
  const { key, cluster } = getPusherConfig();
  if (!key || !cluster) return null;
  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      auth: { headers: {} },
    });
  }
  return pusherClient;
}

