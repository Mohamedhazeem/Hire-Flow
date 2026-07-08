import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TagChipProps = {
  children: ReactNode;
  variant?: "default" | "brand" | "muted";
  className?: string;
};

const variants = {
  default: "bg-bg-elevated border-border-subtle text-text-body",
  brand: "bg-brand/10 text-brand border-brand/20",
  muted: "bg-bg-elevated border-border-subtle text-text-muted",
};

export function TagChip({ children, variant = "default", className }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-radius-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
