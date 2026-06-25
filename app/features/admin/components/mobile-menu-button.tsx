"use client";

import { MenuIcon } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function MobileMenuButton() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="size-9 flex items-center justify-center rounded-md bg-bg-surface border border-border-subtle shadow-sm text-text-muted hover:text-text-heading lg:hidden"
      aria-label="Open sidebar menu"
    >
      <MenuIcon className="size-5" />
    </button>
  );
}
