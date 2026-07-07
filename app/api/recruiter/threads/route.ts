import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";
import { getOtherUserId } from "@/lib/thread-utils";

async function handleGET() {
  const currentUser = await requireRole(["recruiter", "user"]);

  const threads = await prisma.message.groupBy({
    by: ["threadId"],
    where: {
      OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
    },
    _max: { createdAt: true },
  });

  if (threads.length === 0) return ok([]);

  const threadIds = threads
    .sort((a, b) => (b._max.createdAt?.getTime() ?? 0) - (a._max.createdAt?.getTime() ?? 0))
    .map((t) => t.threadId);

  const latestMessages = await prisma.message.findMany({
    where: { threadId: { in: threadIds } },
    orderBy: { createdAt: "desc" },
    distinct: ["threadId"],
    select: {
      threadId: true,
      content: true,
      createdAt: true,
      senderId: true,
      read: true,
      fileUrl: true,
      fileType: true,
    },
  });

  const latestByThread = new Map(latestMessages.map((m) => [m.threadId, m]));

  const otherUserIds = threadIds.map((id) => getOtherUserId(id, currentUser.id));

  const users = await prisma.user.findMany({
    where: { id: { in: otherUserIds } },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const result = threadIds
    .map((threadId) => {
      const otherId = getOtherUserId(threadId, currentUser.id);
      const user = userMap.get(otherId);
      const latest = latestByThread.get(threadId);
      if (!user) return null;
      return {
        threadId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        },
        lastMessage: latest
          ? {
              content:
                latest.content ||
                (latest.fileUrl
                  ? latest.fileType?.startsWith("image/")
                    ? "📷 Photo"
                    : "📎 File"
                  : ""),
              createdAt: latest.createdAt.toISOString(),
              senderId: latest.senderId,
              unread: latest.senderId !== currentUser.id && !latest.read,
            }
          : null,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return ok(result);
}

export const GET = withErrorHandler(handleGET);
