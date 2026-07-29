import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PeopleTablePaginationProps = {
  page: number;
  totalPages: number;
  totalUsers: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function PeopleTablePagination({
  page,
  totalPages,
  totalUsers,
  pageSize,
  onPageChange,
}: PeopleTablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-text-muted">
      <span className="hidden sm:inline">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalUsers)} of {totalUsers}
      </span>
      <span className="sm:hidden text-xs">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalUsers)}/{totalUsers}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
