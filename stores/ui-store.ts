import { create } from "zustand";

type Theme = "light" | "dark" | "system";

type UIState = {
  sidebarOpen: boolean;
  chatSidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  toggleChatSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setChatSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  chatSidebarOpen: false,
  theme: "system",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleChatSidebar: () => set((state) => ({ chatSidebarOpen: !state.chatSidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setChatSidebarOpen: (open) => set({ chatSidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}));
