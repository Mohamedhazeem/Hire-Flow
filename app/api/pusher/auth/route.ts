import { auth } from "@/app/features/auth/libs/auth";
import { NextResponse } from "next/server";
import { participatesInThread, isValidThreadId } from "@/lib/thread-utils";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id") as string;
  const channelName = formData.get("channel_name") as string;

  if (!socketId || !channelName) {
    return new Response("Missing socket_id or channel_name", { status: 400 });
  }

  if (channelName.startsWith("private-thread-")) {
    const threadId = channelName.slice("private-thread-".length);
    if (!isValidThreadId(threadId)) {
      return new Response("Invalid channel name", { status: 403 });
    }
    if (!participatesInThread(threadId, session.user.id)) {
      return new Response("Not a participant in this thread", { status: 403 });
    }
  }

  if (channelName.startsWith("presence-")) {
    const targetUserId = channelName.slice("presence-online-".length);
    if (session.user.id !== targetUserId) {
      return new Response("Cannot authenticate presence as another user", { status: 403 });
    }
  }

  // Lazy-import pusher so the auth route still works when Pusher is not configured
  const { pusher } = await import("@/lib/pusher");
  if (!pusher) {
    return NextResponse.json({ auth: "" }, { status: 200 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: session.user.id,
    user_info: { name: session.user.name },
  });

  return Response.json(authResponse);
}
