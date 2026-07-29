import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTrigger = vi.fn();
vi.mock("@/lib/pusher/pusher", () => ({
  pusher: { trigger: mockTrigger },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: { count: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(() =>
    Promise.resolve({ id: "notif-1", userId: "rec-1", type: "new_message", data: {} }),
  ),
  fireNotification: vi.fn(),
}));

vi.mock("@/lib/rate-limiting/di", () => ({
  rateLimiter: { enforce: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("@/lib/repositories/message-repository", () => {
  const mockMessage = {
    id: "msg-1",
    threadId: "u1_u2",
    senderId: "u1",
    receiverId: "u2",
    content: "Hello",
    read: false,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    fileType: null,
    hiddenFor: [],
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return {
    messageRepository: {
      create: vi.fn().mockResolvedValue(mockMessage),
      findByThreadId: vi.fn(),
      markAsRead: vi.fn(),
      findById: vi.fn(),
      softDelete: vi.fn(),
      hideForParticipant: vi.fn(),
    },
  };
});

vi.mock("@/lib/repositories/thread-repository", () => ({
  threadRepository: {
    groupByThread: vi.fn().mockResolvedValue([]),
    findLatestMessages: vi.fn().mockResolvedValue([]),
    findParticipants: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/app/features/notifications/queries/notification-queries", () => ({
  markThreadNotificationsRead: vi.fn(),
}));

const { messageService } = await import("@/lib/services/message-service");

describe("messageService Pusher events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("fires message-unread-increment on receiver's private channel", async () => {
      const mockVerifyRelation = vi.fn().mockResolvedValue(undefined);
      await messageService.sendMessage({
        threadId: "u1_u2",
        senderId: "u1",
        senderName: "User One",
        senderRole: "user",
        body: { content: "Hello" },
        verifyRelation: mockVerifyRelation,
      });

      expect(mockTrigger).toHaveBeenCalledWith("private-user-u2", "message-unread-increment", {});
    });

    it("still fires the existing new-message thread event", async () => {
      await messageService.sendMessage({
        threadId: "u1_u2",
        senderId: "u1",
        senderName: "User One",
        senderRole: "user",
        body: { content: "Hello" },
      });

      expect(mockTrigger).toHaveBeenCalledWith(
        "private-thread-u1_u2",
        "new-message",
        expect.objectContaining({ senderId: "u1" }),
      );
    });
  });

  describe("getMessages", () => {
    it("fires message-unread-update on caller's channel when unread messages exist", async () => {
      const { messageRepository } = await import("@/lib/repositories/message-repository");
      const mockFindByThreadId = vi.mocked(messageRepository.findByThreadId);
      mockFindByThreadId.mockResolvedValue([
        {
          id: "m1",
          senderId: "u2",
          receiverId: "u1",
          content: "Hey",
          read: false,
          fileUrl: null,
          fileName: null,
          fileSize: null,
          fileType: null,
          hiddenFor: [],
          deletedAt: null,
          createdAt: new Date("2026-07-24T12:00:00Z"),
        } as never,
      ]);

      await messageService.getMessages({
        threadId: "u1_u2",
        userId: "u1",
      });

      expect(mockTrigger).toHaveBeenCalledWith("private-user-u1", "message-unread-update", {});
    });

    it("does NOT fire message-unread-update when no unread messages", async () => {
      const { messageRepository } = await import("@/lib/repositories/message-repository");
      const mockFindByThreadId = vi.mocked(messageRepository.findByThreadId);
      mockFindByThreadId.mockResolvedValue([
        {
          id: "m1",
          senderId: "u2",
          receiverId: "u1",
          content: "Read",
          read: true,
          fileUrl: null,
          fileName: null,
          fileSize: null,
          fileType: null,
          hiddenFor: [],
          deletedAt: null,
          createdAt: new Date("2026-07-24T12:00:00Z"),
        } as never,
      ]);

      await messageService.getMessages({
        threadId: "u1_u2",
        userId: "u1",
      });

      const updateCalls = mockTrigger.mock.calls.filter(
        (call: unknown[]) => call[1] === "message-unread-update",
      );
      expect(updateCalls).toHaveLength(0);
    });

    it("still calls markAsRead and markThreadNotificationsRead when unread messages exist", async () => {
      const { messageRepository } = await import("@/lib/repositories/message-repository");
      const mockFindByThreadId = vi.mocked(messageRepository.findByThreadId);
      mockFindByThreadId.mockResolvedValue([
        {
          id: "m1",
          senderId: "u2",
          receiverId: "u1",
          content: "Hey",
          read: false,
          fileUrl: null,
          fileName: null,
          fileSize: null,
          fileType: null,
          hiddenFor: [],
          deletedAt: null,
          createdAt: new Date("2026-07-24T12:00:00Z"),
        } as never,
      ]);

      await messageService.getMessages({
        threadId: "u1_u2",
        userId: "u1",
      });

      expect(messageRepository.markAsRead).toHaveBeenCalledWith(["m1"]);
      const { markThreadNotificationsRead } =
        await import("@/app/features/notifications/queries/notification-queries");
      expect(markThreadNotificationsRead).toHaveBeenCalledWith("u1_u2", "u1");
    });
  });
});
