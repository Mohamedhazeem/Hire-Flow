import { prisma } from "@/lib/prisma";
import { TooManyRequestsError } from "@/lib/api/api-error";

const MAX_MESSAGES_PER_HOUR = 20;

export async function checkMessageRateLimit(senderId: string, receiverId: string): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 3600000);

  const count = await prisma.message.count({
    where: {
      senderId,
      receiverId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (count >= MAX_MESSAGES_PER_HOUR) {
    throw new TooManyRequestsError(
      "Message limit reached. You can send up to 20 messages per hour.",
    );
  }
}
