"use client";

import { Button } from "@/components/ui/button";

type ShowMoreToggleProps = {
  totalCount: number;
  visibleCount: number;
  showAll: boolean;
  onToggle: () => void;
  label?: string;
};

export function ShowMoreToggle({
  totalCount,
  visibleCount,
  showAll,
  onToggle,
  label = "items",
}: ShowMoreToggleProps) {
  if (showAll || totalCount <= visibleCount) return null;

  return (
    <div className="flex justify-center mt-4">
      <Button variant="ghost" size="sm" onClick={onToggle}>
        Show all {totalCount} {label}
      </Button>
    </div>
  );
}
