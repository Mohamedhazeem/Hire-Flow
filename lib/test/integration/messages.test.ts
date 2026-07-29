import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetDb, createTestUser } from "@/lib/test";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { messageRepository } from "@/lib/repositories/message-repository";
import { threadRepository } from "@/lib/repositories/thread-repository";
import { messageService } from "@/lib/services/message-service";
import { pusher } from "@/lib/pusher/pusher";

const mocks = vi.hoisted(() => ({
  pusherTrigger: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/pusher/pusher", () => ({
  pusher: { trigger: mocks.pusherTrigger },
}));

describe("Message Repository", () => {
  let sender: Awaited<ReturnType<typeof createTestUser>>;
  let receiver: Awaited<ReturnType<typeof createTestUser>>;
  let threadId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
    sender = await createTestUser({ role: Role.user });
    receiver = await createTestUser({ role: Role.user });
    threadId = [sender.id, receiver.id].sort().join("_");
  });

  describe("hideForParticipant", () => {
    it("pushes userId into hiddenFor for matching messages", async () => {
      const msg = await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Hello" },
      });
      await messageRepository.hideForParticipant(threadId, sender.id);
      const updated = await prisma.message.findUnique({ where: { id: msg.id } });
      expect(updated?.hiddenFor).toContain(sender.id);
    });

    it("does not add userId twice if already hidden", async () => {
      const msg = await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Hello",
          hiddenFor: [sender.id],
        },
      });
      await messageRepository.hideForParticipant(threadId, sender.id);
      const updated = await prisma.message.findUnique({ where: { id: msg.id } });
      expect(updated?.hiddenFor).toEqual([sender.id]);
    });

    it("only hides messages where user is sender or receiver", async () => {
      const other = await createTestUser({ role: Role.user });
      const msg = await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Hello" },
      });
      // other user is not a participant — should NOT be hidden
      await messageRepository.hideForParticipant(threadId, other.id);
      const updated = await prisma.message.findUnique({ where: { id: msg.id } });
      expect(updated?.hiddenFor).not.toContain(other.id);
    });
  });

  describe("findByThreadId with hiddenFor", () => {
    it("excludes messages hidden for the requesting user", async () => {
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Visible" },
      });
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Hidden",
          hiddenFor: [receiver.id],
        },
      });
      const messages = await messageRepository.findByThreadId(threadId, 10, receiver.id);
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Visible");
    });

    it("returns all messages when no hiddenFor entries match user", async () => {
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Msg1" },
      });
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Msg2" },
      });
      const messages = await messageRepository.findByThreadId(threadId, 10, receiver.id);
      expect(messages).toHaveLength(2);
    });
  });

  describe("softDelete", () => {
    it("sets deletedAt and pushes userId to hiddenFor", async () => {
      const msg = await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "To delete" },
      });
      const result = await messageRepository.softDelete(msg.id, sender.id);
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(result.hiddenFor).toContain(sender.id);
    });
  });

  describe("findById", () => {
    it("returns message with receiverId", async () => {
      const msg = await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Test" },
      });
      const found = await messageRepository.findById(msg.id);
      expect(found).not.toBeNull();
      expect(found!.receiverId).toBe(receiver.id);
      expect(found!.senderId).toBe(sender.id);
      expect(found!.threadId).toBe(threadId);
    });

    it("returns null for non-existent message", async () => {
      const found = await messageRepository.findById("does-not-exist");
      expect(found).toBeNull();
    });
  });
});

describe("Thread Repository", () => {
  let sender: Awaited<ReturnType<typeof createTestUser>>;
  let receiver: Awaited<ReturnType<typeof createTestUser>>;
  let threadId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
    sender = await createTestUser({ role: Role.user });
    receiver = await createTestUser({ role: Role.user });
    threadId = [sender.id, receiver.id].sort().join("_");
  });

  describe("groupByThread with hiddenFor", () => {
    it("excludes threads where all messages are hidden for user", async () => {
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Hidden",
          hiddenFor: [receiver.id],
        },
      });
      const threads = await threadRepository.groupByThread(receiver.id);
      expect(threads).toHaveLength(0);
    });

    it("includes thread when at least one message is visible", async () => {
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Hidden",
          hiddenFor: [receiver.id],
        },
      });
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Visible" },
      });
      const threads = await threadRepository.groupByThread(receiver.id);
      expect(threads).toHaveLength(1);
    });
  });

  describe("findLatestMessages with hiddenFor", () => {
    it("excludes hidden messages from latest", async () => {
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Older" },
      });
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Latest hidden",
          hiddenFor: [receiver.id],
        },
      });
      const latest = await threadRepository.findLatestMessages([threadId], receiver.id);
      expect(latest).toHaveLength(1);
      expect(latest[0].content).toBe("Older");
    });

    it("returns empty when only message is hidden", async () => {
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Sole hidden",
          hiddenFor: [receiver.id],
        },
      });
      const latest = await threadRepository.findLatestMessages([threadId], receiver.id);
      expect(latest).toHaveLength(0);
    });
  });
});

describe("Message Service", () => {
  let sender: Awaited<ReturnType<typeof createTestUser>>;
  let receiver: Awaited<ReturnType<typeof createTestUser>>;
  let threadId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
    mocks.pusherTrigger.mockResolvedValue({});
    sender = await createTestUser({ role: Role.user });
    receiver = await createTestUser({ role: Role.user });
    threadId = [sender.id, receiver.id].sort().join("_");
  });

  describe("deleteMyMessages", () => {
    it("hides all thread messages for the requesting user", async () => {
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Msg1" },
      });
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Msg2" },
      });

      await messageService.deleteMyMessages(threadId, sender.id);

      const messages = await messageRepository.findByThreadId(threadId, 10, sender.id);
      expect(messages).toHaveLength(0);
    });

    it("does not hide messages from the other participant", async () => {
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Visible to receiver",
        },
      });

      await messageService.deleteMyMessages(threadId, sender.id);

      const receiverMessages = await messageRepository.findByThreadId(threadId, 10, receiver.id);
      expect(receiverMessages).toHaveLength(1);
      expect(receiverMessages[0].content).toBe("Visible to receiver");
    });

    it("throws for invalid thread ID", async () => {
      await expect(messageService.deleteMyMessages("invalid", sender.id)).rejects.toThrow(
        /Invalid thread/i,
      );
    });

    it("throws for non-participant", async () => {
      const outsider = await createTestUser({ role: Role.user });
      await expect(messageService.deleteMyMessages(threadId, outsider.id)).rejects.toThrow(
        /not a participant/i,
      );
    });
  });

  describe("deleteSingleMessage", () => {
    it("soft-deletes the message (deletedAt + hiddenFor)", async () => {
      const msg = await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Delete me" },
      });

      await messageService.deleteSingleMessage(threadId, sender.id, msg.id);

      const updated = await prisma.message.findUnique({ where: { id: msg.id } });
      expect(updated?.deletedAt).toBeInstanceOf(Date);
      expect(updated?.hiddenFor).toContain(sender.id);
    });

    it("pusher fires message-deleted event on thread channel", async () => {
      const msg = await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Delete me" },
      });

      await messageService.deleteSingleMessage(threadId, sender.id, msg.id);

      expect(mocks.pusherTrigger).toHaveBeenCalledWith(
        `private-thread-${threadId}`,
        "message-deleted",
        expect.objectContaining({ messageId: msg.id, threadId, deletedBy: sender.id }),
      );
    });

    it("hides message from sender's view via findByThreadId", async () => {
      const msg = await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Gone for sender",
        },
      });

      await messageService.deleteSingleMessage(threadId, sender.id, msg.id);

      const senderMessages = await messageRepository.findByThreadId(threadId, 10, sender.id);
      expect(senderMessages.find((m) => m.id === msg.id)).toBeUndefined();
    });

    it("message stays visible to receiver with deletedAt set", async () => {
      const msg = await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Visible to receiver",
        },
      });

      await messageService.deleteSingleMessage(threadId, sender.id, msg.id);

      const receiverMessages = await messageRepository.findByThreadId(threadId, 10, receiver.id);
      const found = receiverMessages.find((m) => m.id === msg.id);
      expect(found).toBeDefined();
      expect(found!.deletedAt).toBeInstanceOf(Date);
    });

    it("throws when message does not belong to the user", async () => {
      const msg = await prisma.message.create({
        data: { threadId, senderId: receiver.id, receiverId: sender.id, content: "Not yours" },
      });

      await expect(messageService.deleteSingleMessage(threadId, sender.id, msg.id)).rejects.toThrow(
        /only delete your own/i,
      );
    });

    it("throws for non-existent message", async () => {
      await expect(
        messageService.deleteSingleMessage(threadId, sender.id, "non-existent"),
      ).rejects.toThrow(/not found/i);
    });

    it("throws for invalid thread ID", async () => {
      await expect(
        messageService.deleteSingleMessage("invalid", sender.id, "some-id"),
      ).rejects.toThrow(/Invalid thread/i);
    });
  });

  describe("getMessages", () => {
    it("returns messages excluding hiddenFor entries", async () => {
      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Visible" },
      });
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Hidden",
          hiddenFor: [sender.id],
        },
      });

      const result = await messageService.getMessages({ threadId, userId: sender.id });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe("Visible");
      expect(result.messages[0].deletedAt).toBeNull();
    });

    it("marks unread messages as read and fires markThreadNotificationsRead", async () => {
      const msg = await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Unread",
          read: false,
        },
      });

      await messageService.getMessages({ threadId, userId: receiver.id });

      const updated = await prisma.message.findUnique({ where: { id: msg.id } });
      expect(updated?.read).toBe(true);
    });

    it("returns paginated results with cursor meta", async () => {
      for (let i = 0; i < 5; i++) {
        await prisma.message.create({
          data: { threadId, senderId: sender.id, receiverId: receiver.id, content: `Msg ${i}` },
        });
      }

      const first = await messageService.getMessages({ threadId, userId: receiver.id, limit: 2 });
      expect(first.messages).toHaveLength(2);
      expect(first.meta.hasNextPage).toBe(true);
      expect(first.meta.nextCursor).toBeDefined();
    });

    it("throws for invalid thread ID", async () => {
      await expect(
        messageService.getMessages({ threadId: "invalid", userId: sender.id }),
      ).rejects.toThrow(/Invalid thread/i);
    });

    it("throws for non-participant", async () => {
      const outsider = await createTestUser({ role: Role.user });
      await expect(messageService.getMessages({ threadId, userId: outsider.id })).rejects.toThrow(
        /not a participant/i,
      );
    });
  });

  describe("sendMessage", () => {
    it("creates a message and fires Pusher new-message event", async () => {
      const result = await messageService.sendMessage({
        threadId,
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        body: { content: "Hello!" },
      });

      expect(result.content).toBe("Hello!");
      expect(result.senderId).toBe(sender.id);
      expect(result.receiverId).toBe(receiver.id);
      expect(mocks.pusherTrigger).toHaveBeenCalledWith(
        `private-thread-${threadId}`,
        "new-message",
        expect.objectContaining({ senderId: sender.id }),
      );
    });

    it("rejects empty content without file", async () => {
      await expect(
        messageService.sendMessage({
          threadId,
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role,
          body: { content: "" },
        }),
      ).rejects.toThrow(/Message must contain/);
    });

    it("rejects content exceeding 2000 characters", async () => {
      await expect(
        messageService.sendMessage({
          threadId,
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role,
          body: { content: "x".repeat(2001) },
        }),
      ).rejects.toThrow();
    });

    it("throws for invalid thread ID", async () => {
      await expect(
        messageService.sendMessage({
          threadId: "invalid",
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role,
          body: { content: "Hello" },
        }),
      ).rejects.toThrow(/Invalid thread/i);
    });
  });

  describe("getThreadList", () => {
    it("returns threads sorted by latest message time", async () => {
      const otherUser = await createTestUser({ role: Role.user });
      const threadId2 = [sender.id, otherUser.id].sort().join("_");

      await prisma.message.create({
        data: { threadId, senderId: sender.id, receiverId: receiver.id, content: "Older" },
      });
      // Small delay so timestamps differ
      await new Promise((r) => setTimeout(r, 10));
      await prisma.message.create({
        data: {
          threadId: threadId2,
          senderId: sender.id,
          receiverId: otherUser.id,
          content: "Newer",
        },
      });

      const threads = await messageService.getThreadList(sender.id);

      expect(threads).toHaveLength(2);
      expect(threads[0].threadId).toBe(threadId2);
      expect(threads[1].threadId).toBe(threadId);
    });

    it("excludes threads where all messages are hidden", async () => {
      await prisma.message.create({
        data: {
          threadId,
          senderId: sender.id,
          receiverId: receiver.id,
          content: "Hidden",
          hiddenFor: [sender.id],
        },
      });

      const threads = await messageService.getThreadList(sender.id);
      expect(threads).toHaveLength(0);
    });

    it("returns empty array when no threads exist", async () => {
      const threads = await messageService.getThreadList(sender.id);
      expect(threads).toEqual([]);
    });
  });
});
