"use client";

export type MessageItem = {
  id: string;
  senderId: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
  read: boolean;
  deletedAt: string | null;
  hiddenFor: string[];
};
