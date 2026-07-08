import { StatCard } from "@/components/ui/stat-card";
import type { ReactNode } from "react";

type StatItem = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  gradient: string;
};

type AnalyticsStatRowProps = { items: StatItem[] };

export function AnalyticsStatRow({ items }: AnalyticsStatRowProps) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatCard key={item.title} {...item} value={String(item.value)} />
      ))}
    </div>
  );
}
