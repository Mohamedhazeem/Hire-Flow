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
  /** Unique key for this column */
  key: string;
  /** Column header label */
  header: string;
  /** Render cell content. Receives the full row object. */
  cell: (row: TData) => React.ReactNode;
  /** Optional extra className for the <th> and <td> */
  className?: string;
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
        "rounded-radius-lg border border-border-subtle bg-bg-surface overflow-hidden",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-elevated hover:bg-bg-elevated">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn("text-text-muted text-xs font-semibold uppercase tracking-wide px-4 py-3", col.className)}
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
                    className={cn("px-4 py-3 text-sm text-text-body", col.className)}
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
