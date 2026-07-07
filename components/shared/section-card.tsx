import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  count?: number;
  countLabel?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, count, countLabel, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-bg-surface overflow-hidden transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-6 py-3.5 bg-bg-elevated/60 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">
          {title}
        </h2>
        {count != null && (
          <span className="text-xs text-text-muted">
            {count} {countLabel ?? ""}
          </span>
        )}
      </div>
      <div className="border-t border-border-subtle/40" />
      <div className="p-6">{children}</div>
    </div>
  );
}
