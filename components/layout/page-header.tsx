import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Primary page title — rendered as an <h1> */
  title: string;
  /** Optional subtitle / description below the title */
  description?: string;
  /** Slot for action buttons rendered on the right side */
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        "pb-6 border-b border-border-subtle",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-heading leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 mt-3 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
