import { create } from "zustand";

type ChatState = {
  activeThreadId: string | null;
  unreadCounts: Record<string, number>;
  setActiveThreadId: (threadId: string | null) => void;
  setUnreadCount: (threadId: string, count: number) => void;
  incrementUnread: (threadId: string) => void;
  resetUnread: (threadId: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  unreadCounts: {},
  setActiveThreadId: (threadId) => set({ activeThreadId: threadId }),
  setUnreadCount: (threadId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [threadId]: count },
    })),
  incrementUnread: (threadId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [threadId]: (state.unreadCounts[threadId] ?? 0) + 1,
      },
    })),
  resetUnread: (threadId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [threadId]: 0 },
    })),
}));
