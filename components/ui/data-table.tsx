"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type ColumnDef<TData> = {
  key: string;
  header: string;
  cell: (row: TData) => React.ReactNode;
  className?: string;
  /** Alignment for the column content (both header and body). Defaults to left. */
  align?: "left" | "center" | "right";
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  /** Shown when data is empty */
  emptyMessage?: string;
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results found.",
  className,
}: DataTableProps<TData>) {
  return (
    <div
      className={cn(
        "rounded-radius-lg border border-border-subtle bg-bg-surface overflow-x-auto",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-elevated hover:bg-bg-elevated">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-text-muted text-xs font-semibold uppercase tracking-wide px-4 py-3 text-left",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-text-muted text-sm"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                className="border-b border-border-subtle last:border-0 transition-colors hover:bg-bg-elevated/50"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-sm text-text-body",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      (!col.align || col.align === "left") && "text-left",
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
