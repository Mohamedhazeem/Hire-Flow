"use client";

import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@/components/ui/data-table";
import { JobTableActionsCell } from "./job-table-actions-cell";
import type { AdminJobRow } from "@/app/features/admin/queries/job-queries";

type JobTableActions = {
  onToggle: (jobId: string, currentActive: boolean) => void;
  onDelete: (jobId: string) => void;
  isToggling: boolean;
  deletingId: string | null;
  isDeleting: boolean;
};

export function createJobTableColumns(actions: JobTableActions): ColumnDef<AdminJobRow>[] {
  return [
    {
      key: "title",
      header: "Title",
      align: "center",
      cell: (row) => (
        <span className="font-medium text-text-heading max-w-xs truncate block">{row.title}</span>
      ),
    },
    {
      key: "company",
      header: "Company",
      align: "center",
      cell: (row) => <span className="text-text-body">{row.companyName ?? "—"}</span>,
    },
    {
      key: "recruiter",
      header: "Recruiter",
      align: "center",
      cell: (row) => (
        <span className="text-text-body">{row.recruiterName ?? row.recruiterEmail}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "applications",
      header: "Apps",
      align: "center",
      cell: (row) => (
        <span className="text-text-body text-center block">{row.applicationCount}</span>
      ),
    },
    {
      key: "views",
      header: "Views",
      align: "center",
      cell: (row) => <span className="text-text-body text-center block">{row.viewCount}</span>,
    },
    {
      key: "workMode",
      header: "Mode",
      align: "center",
      cell: (row) => <span className="text-text-body capitalize">{row.workMode}</span>,
    },
    {
      key: "employmentType",
      header: "Type",
      align: "center",
      cell: (row) => (
        <span className="text-text-body capitalize">{row.employmentType.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      align: "center",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <JobTableActionsCell
          row={row}
          onToggle={actions.onToggle}
          onDelete={actions.onDelete}
          isToggling={actions.isToggling}
          isDeleting={actions.deletingId === row.id && actions.isDeleting}
        />
      ),
    },
  ];
}
