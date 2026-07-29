import Pusher from "pusher";
import { env } from "@/utils/env";

function createPusherServer(): Pusher | null {
  if (
    !env.data?.PUSHER_APP_ID ||
    !env.data?.PUSHER_KEY ||
    !env.data?.PUSHER_SECRET ||
    !env.data?.PUSHER_CLUSTER
  ) {
    return null;
  }
  return new Pusher({
    appId: env.data.PUSHER_APP_ID,
    key: env.data.PUSHER_KEY,
    secret: env.data.PUSHER_SECRET,
    cluster: env.data.PUSHER_CLUSTER,
    useTLS: true,
  });
}

const realPusher = createPusherServer();

/**
 * No-op Pusher instance used when env vars are not configured.
 * Every method returns a void no-op so callers don't need null checks.
 */
function createNoopPusher(): Pusher {
  const noop = () => Promise.resolve();
  return new Proxy({} as Pusher, {
    get(_target, _prop) {
      return noop;
    },
  });
}

/** Pusher instance. All calls are no-ops when Pusher is not configured. */
export const pusher: Pusher = realPusher ?? createNoopPusher();
