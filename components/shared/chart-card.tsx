import { type ReactNode } from "react";

type ChartCardProps = {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
  className,
}: ChartCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className={`size-9 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-heading">{title}</h2>
          <p className="text-[11px] text-text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
