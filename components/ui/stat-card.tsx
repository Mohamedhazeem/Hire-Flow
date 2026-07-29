import { cn } from "@/lib/utils";
import Link from "next/link";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; label: string };
  href?: string;
  gradient?: string;
  className?: string;
};

export function StatCard({ title, value, icon, description, trend, href, gradient, className }: StatCardProps) {
  const accentGradient = gradient ?? "from-brand/10 via-brand/5 to-transparent";

  const inner = (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30",
        "group",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-text-heading mt-1.5 tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value >= 0 ? (
                <TrendingUpIcon className="size-3.5 text-success shrink-0" />
              ) : (
                <TrendingDownIcon className="size-3.5 text-error shrink-0" />
              )}
              <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-success" : "text-error")}>
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "size-11 rounded-xl shrink-0 flex items-center justify-center",
            "bg-linear-to-br",
            accentGradient,
            "text-brand",
          )}
        >
          {icon}
        </div>
      </div>
      {description && <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border-subtle">{description}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }

  return inner;
}
