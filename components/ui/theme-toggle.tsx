"use client";

import { useSyncExternalStore, useEffect } from "react";
import { MoonIcon, SunIcon, MonitorIcon } from "lucide-react";
import { useUIStore, type Theme } from "@/stores/ui-store";

const themes: { value: Theme; icon: typeof SunIcon; label: string }[] = [
  { value: "light", icon: SunIcon, label: "Light" },
  { value: "dark", icon: MoonIcon, label: "Dark" },
  { value: "system", icon: MonitorIcon, label: "System" },
];

export function ThemeToggle({ collapsed, variant }: { collapsed?: boolean; variant?: "icon" }) {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  const cycleIndex = (themes.findIndex((t) => t.value === theme) + 1) % themes.length;

  if (variant === "icon") {
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex items-center justify-center size-9 rounded-md text-text-muted hover:text-text-body hover:bg-bg-muted transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
      </button>
    );
  }

  if (collapsed) {
    const Icon = themes[cycleIndex].icon;
    return (
      <button
        onClick={() => setTheme(themes[cycleIndex].value)}
        className="flex items-center justify-center w-full p-2 rounded-md text-text-muted hover:bg-bg-elevated hover:text-text-heading transition-colors"
        title={`Theme: ${themes[cycleIndex].label}`}
      >
        <Icon className="size-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-bg-elevated p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center justify-center gap-1.5 flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
            theme === value
              ? "bg-bg-surface text-text-heading shadow-xs"
              : "text-text-muted hover:text-text-heading"
          }`}
          title={label}
        >
          <Icon className="size-3.5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
