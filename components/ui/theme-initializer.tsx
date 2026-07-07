"use client";

import { useEffect } from "react";
import type { Theme } from "@/stores/ui-store";
import { useUIStore } from "@/stores/ui-store";
const UI_STORAGE_KEY = "hireflow-ui";

function getPersistedTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) return "system";
    const parsed = JSON.parse(raw) as { state?: { theme?: Theme } };
    return parsed?.state?.theme ?? "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}
export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");

    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === UI_STORAGE_KEY) {
        const theme = getPersistedTheme();
        applyTheme(theme);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <>{children}</>;
}
