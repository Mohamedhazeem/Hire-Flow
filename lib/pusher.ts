import Pusher from "pusher";
import { env } from "@/utils/env";

export const pusher = new Pusher({
  appId: env.data!.PUSHER_APP_ID,
  key: env.data!.PUSHER_KEY,
  secret: env.data!.PUSHER_SECRET,
  cluster: env.data!.PUSHER_CLUSTER,
  useTLS: true,
});

