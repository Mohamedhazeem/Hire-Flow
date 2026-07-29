export type CreateMessageData = {
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
};

export type MessageRow = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  createdAt: Date;
  read: boolean;
  deletedAt: Date | null;
  hiddenFor: string[];
};

export type MessageWithCreatedAt = MessageRow;

export type MessageIdOnly = {
  id: string;
  senderId: string;
  receiverId: string;
  threadId: string;
};

export interface IMessageRepository {
  findByThreadId(threadId: string, take: number, userId: string, cursor?: { id: string }): Promise<MessageRow[]>;

  create(data: CreateMessageData): Promise<MessageWithCreatedAt>;

  markAsRead(messageIds: string[]): Promise<unknown>;

  deleteBySender(threadId: string, senderId: string): Promise<unknown>;

  hideForParticipant(threadId: string, userId: string): Promise<unknown>;

  findById(messageId: string): Promise<MessageIdOnly | null>;

  softDelete(messageId: string, userId: string): Promise<MessageRow>;

  deleteById(messageId: string): Promise<unknown>;
}
