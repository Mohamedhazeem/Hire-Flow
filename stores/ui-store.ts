import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

type PersistedState = {
  sidebarOpen: boolean;
  chatSidebarOpen: boolean;
  theme: Theme;
};

type UIStore = PersistedState & {
  toggleSidebar: () => void;
  toggleChatSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setChatSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
};

const UI_STORAGE_KEY = "hireflow-ui";

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      chatSidebarOpen: false,
      theme: "system",
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleChatSidebar: () => set((state) => ({ chatSidebarOpen: !state.chatSidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setChatSidebarOpen: (open) => set({ chatSidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: UI_STORAGE_KEY,
      partialize: (state): PersistedState => ({
        sidebarOpen: state.sidebarOpen,
        chatSidebarOpen: state.chatSidebarOpen,
        theme: state.theme,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<PersistedState>),
      }),
      skipHydration: false,
    },
  ),
);
