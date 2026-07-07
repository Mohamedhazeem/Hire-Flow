import type { ReactNode } from "react";
import { SectionCard } from "@/components/shared/section-card";
import { ShowMoreToggle } from "@/components/shared/show-more-toggle";

type DataTableSectionProps = {
  title: string;
  count: number;
  countLabel: string;
  children: ReactNode;
  totalCount: number;
  visibleCount: number;
  showAll: boolean;
  onShowAll: () => void;
};

/**
 * SectionCard with a flush full-width table inside (uses -mx-6 -mb-6 -mt-6),
 * plus a "Show all N items" toggle when rows exceed the initial limit.
 */
export function DataTableSection({
  title,
  count,
  countLabel,
  children,
  totalCount,
  visibleCount,
  showAll,
  onShowAll,
}: DataTableSectionProps) {
  return (
    <SectionCard title={title} count={count} countLabel={countLabel}>
      <div className="overflow-x-auto -mx-6 -mb-6 -mt-6">{children}</div>
      <ShowMoreToggle
        totalCount={totalCount}
        visibleCount={visibleCount}
        showAll={showAll}
        onToggle={onShowAll}
        label={countLabel}
      />
    </SectionCard>
  );
}
