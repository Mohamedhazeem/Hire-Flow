/**
 * Message factory — creates real `message` rows in the test database.
 *
 * A "thread" in this app is a derived concept (computed from threadId on
 * Message rows). This factory creates individual messages within a thread.
 *
 * Renamed from `createTestThread` → `createTestMessage` to accurately reflect
 * what it creates (a Message row, not a Thread model).
 *
 * @param threadId - The computed thread identifier shared by all messages in a conversation.
 */
import { faker } from "@faker-js/faker";
import type { Prisma } from "../../../app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function createTestMessage(threadId: string, overrides?: Partial<Prisma.MessageUncheckedCreateInput>) {
  return prisma.message.create({
    data: {
      id: overrides?.id ?? faker.string.uuid(),
      threadId,
      senderId: overrides?.senderId ?? faker.string.uuid(),
      receiverId: overrides?.receiverId ?? faker.string.uuid(),
      content: overrides?.content ?? faker.lorem.sentence(),
      fileUrl: overrides?.fileUrl ?? null,
      fileName: overrides?.fileName ?? null,
      fileSize: overrides?.fileSize ?? null,
      fileType: overrides?.fileType ?? null,
      read: overrides?.read ?? false,
      hiddenFor: overrides?.hiddenFor ?? [],
      deletedAt: overrides?.deletedAt ?? null,
      ...overrides,
    },
  });
}
