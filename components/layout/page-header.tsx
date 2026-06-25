import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, icon, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
          "pb-5 border-b-2 border-border-subtle",
          "bg-gradient-to-r from-brand/5 via-brand/5 to-transparent -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pt-6 pb-5",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="size-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-heading">{title}</h1>
            {description && (
              <p className="text-sm text-text-muted mt-0.5 line-clamp-2">{description}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
