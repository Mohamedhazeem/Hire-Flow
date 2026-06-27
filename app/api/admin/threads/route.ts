import { ok } from "@/lib/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-wrapper";

function getOtherUserId(threadId: string, userId: string): string {
  const parts = threadId.split("_");
  return parts[0] === userId ? parts[1] : parts[0];
}

async function handleGET() {
  const adminUser = await requireRole(["admin", "super_admin"]);

  const threads = await prisma.message.groupBy({
    by: ["threadId"],
    where: {
      OR: [{ senderId: adminUser.id }, { receiverId: adminUser.id }],
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

  const otherUserIds = threadIds.map((id) => getOtherUserId(id, adminUser.id));

  const users = await prisma.user.findMany({
    where: { id: { in: otherUserIds } },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const result = threadIds
    .map((threadId) => {
      const otherId = getOtherUserId(threadId, adminUser.id);
      const user = userMap.get(otherId);
      const latest = latestByThread.get(threadId);
      if (!user) return null;
      return {
        threadId,
        user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role },
        lastMessage: latest
          ? {
              content: latest.content || (latest.fileUrl ? (latest.fileType?.startsWith("image/") ? "📷 Photo" : "📎 File") : ""),
              createdAt: latest.createdAt.toISOString(),
              senderId: latest.senderId,
              unread: latest.senderId !== adminUser.id && !latest.read,
            }
          : null,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return ok(result);
}

export const GET = withErrorHandler(handleGET);
