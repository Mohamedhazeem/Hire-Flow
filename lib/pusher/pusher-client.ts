import Pusher from "pusher-js";
import { env } from "@/utils/env";

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (!env.data?.NEXT_PUBLIC_PUSHER_KEY || !env.data?.NEXT_PUBLIC_PUSHER_CLUSTER) {
    return null;
  }
  if (!pusherClient) {
    pusherClient = new Pusher(env.data.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.data.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
      auth: { headers: {} },
    });
  }
  return pusherClient;
}

