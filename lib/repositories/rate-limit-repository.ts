import { prisma } from "@/lib/prisma";
import ms from "ms";
export async function countRecentMessages(
  senderId: string,
  receiverId: string,
  windowMs = ms("1h"),
): Promise<number> {
  const cutoff = new Date(Date.now() - windowMs);
  return prisma.message.count({
    where: { senderId, receiverId, createdAt: { gte: cutoff } },
  });
}
