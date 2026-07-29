"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type ApplicantTablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
};

export function ApplicantTablePagination({
  page,
  totalPages,
  total,
  hasPrevPage,
  hasNextPage,
  onPageChange,
}: ApplicantTablePaginationProps) {
  return (
    <div className="flex items-center justify-between text-sm text-text-muted gap-2">
      <span className="hidden sm:inline">
        Page {page} of {totalPages}
        {total > 0 ? ` (${total} total)` : ""}
      </span>
      <span className="sm:hidden text-xs">
        {page}/{totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrevPage} onClick={() => onPageChange(Math.max(1, page - 1))}>
          <ChevronLeftIcon className="size-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>
        <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
