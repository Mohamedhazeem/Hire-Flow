"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type ColumnDef<TData> = {
  key: string;
  header: string;
  cell: (row: TData) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
  className?: string;
  enableSelection?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  getRowId?: (row: TData) => string;
  disabledIds?: Set<string>;
};

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results found.",
  className,
  enableSelection,
  selectedIds,
  onSelectionChange,
  getRowId,
  disabledIds,
}: DataTableProps<TData>) {
  const selectableRows = disabledIds
    ? data.filter((row) => !disabledIds.has(getRowId?.(row) ?? ""))
    : data;

  const allSelected =
    enableSelection &&
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedIds?.has(getRowId?.(row) ?? ""));

  const someSelected =
    enableSelection && selectableRows.some((row) => selectedIds?.has(getRowId?.(row) ?? ""));

  const handleSelectAll = () => {
    if (!enableSelection || !onSelectionChange || !getRowId) return;
    if (allSelected) {
      const newSet = new Set(selectedIds);
      for (const row of selectableRows) {
        newSet.delete(getRowId(row));
      }
      onSelectionChange(newSet);
    } else {
      const newSet = new Set(selectedIds);
      for (const row of selectableRows) {
        newSet.add(getRowId(row));
      }
      onSelectionChange(newSet);
    }
  };

  const handleRowSelect = (row: TData) => {
    if (!enableSelection || !onSelectionChange || !getRowId) return;
    const id = getRowId(row);
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onSelectionChange(newSet);
  };

  const allColumns = enableSelection
    ? [
        {
          key: "__selection",
          header: "",
          cell: () => null,
          className: "w-10",
        } as ColumnDef<TData>,
        ...columns,
      ]
    : columns;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-bg-surface overflow-x-auto shadow-xs",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-linear-to-r from-bg-elevated via-bg-elevated to-bg-elevated/50 hover:bg-linear-to-r hover:from-bg-elevated hover:via-bg-elevated hover:to-bg-elevated/50 border-b-2 border-border-subtle">
            {allColumns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-text-muted text-[11px] font-bold uppercase tracking-wider px-5 py-3.5",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.key === "__selection" ? (
                  <Checkbox
                    checked={allSelected}
                    data-state={
                      allSelected ? "checked" : someSelected ? "indeterminate" : "unchecked"
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className="size-4"
                  />
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="h-28 text-center text-text-muted text-sm"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="size-8 text-text-muted/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <span>{emptyMessage}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => {
              const rowId = getRowId?.(row) ?? String(rowIdx);
              const isSelected = selectedIds?.has(rowId);
              const isDisabled = disabledIds?.has(rowId) ?? false;

              return (
                <TableRow
                  key={rowId}
                  className={cn(
                    "border-b border-border-subtle last:border-0 transition-all duration-150",
                    isDisabled && "opacity-50",
                    isSelected && "bg-brand/4",
                    !isSelected && !isDisabled && "hover:bg-brand/2",
                  )}
                  onClick={() => {
                    if (isDisabled) return;
                    if (enableSelection) handleRowSelect(row);
                  }}
                >
                  {allColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-5 py-3 text-sm text-text-body",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right",
                        col.className,
                      )}
                    >
                      {col.key === "__selection" ? (
                        <Checkbox
                          checked={isSelected ?? false}
                          onCheckedChange={() => {
                            if (isDisabled) return;
                            handleRowSelect(row);
                          }}
                          aria-label="Select row"
                          className="size-4"
                          disabled={isDisabled}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        col.cell(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
