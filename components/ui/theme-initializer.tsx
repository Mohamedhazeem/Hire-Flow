"use client";

import { useEffect, useRef } from "react";
import type { Theme } from "@/stores/ui-store";

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

/**
 * Applies the persisted theme to <html> on every page,
 * including auth pages where ThemeToggle is not mounted.
 */
export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    const theme = getPersistedTheme();
    applyTheme(theme);

    // Listen for system preference changes when theme is "system"
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  // Re-apply whenever the store's theme value changes (cross-tab sync)
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
