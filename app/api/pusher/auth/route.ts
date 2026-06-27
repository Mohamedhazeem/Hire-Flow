import { auth } from "@/app/features/auth/libs/auth";
import { pusher } from "@/lib/pusher";

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
    const parts = threadId.split("_");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return new Response("Invalid channel name", { status: 403 });
    }
    if (session.user.id !== parts[0] && session.user.id !== parts[1]) {
      return new Response("Not a participant in this thread", { status: 403 });
    }
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: session.user.id,
    user_info: { name: session.user.name },
  });

  return Response.json(authResponse);
}
