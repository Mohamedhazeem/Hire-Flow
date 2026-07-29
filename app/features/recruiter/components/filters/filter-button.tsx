"use client";

import { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FilterButtonProps = {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  badgeCount?: number;
  children?: ReactNode;
};

export function FilterButton({ icon, label, isActive, badgeCount, children }: FilterButtonProps) {
  return (
    <Popover>
      <PopoverTrigger className="outline-none" aria-label={label}>
        <div
          className={cn(
            "relative flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 transition-all",
            isActive
              ? "border-brand/50 bg-brand/5 text-brand"
              : "border-border bg-background text-text-muted hover:border-border-strong hover:text-text-body hover:bg-bg-subtle dark:border-border/60",
          )}
          title={label}
        >
          {icon}
          <span className="text-xs font-medium">{label}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              {badgeCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={6} className="w-52 p-1">
        {children}
      </PopoverContent>
    </Popover>
  );
}
