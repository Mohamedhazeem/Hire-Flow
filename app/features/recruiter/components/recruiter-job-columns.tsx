"use client";

import type { ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import type { RecruiterJobRow } from "@/app/features/recruiter/queries/job-queries";
import { ExternalLinkIcon, PencilIcon, PlayIcon, ArchiveIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";

const STATUS_BADGE: Record<
  string,
  { variant: "default" | "secondary" | "outline"; label: string }
> = {
  draft: { variant: "secondary", label: "Draft" },
  active: { variant: "default", label: "Active" },
  archived: { variant: "outline", label: "Archived" },
};

type Actions = {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onToggle: (id: string, status: string) => void;
  onDelete: (job: RecruiterJobRow) => void;
  isPending: boolean;
  deletingId: string | null;
  isDeleting: boolean;
};

export function createRecruiterJobColumns(actions: Actions): ColumnDef<RecruiterJobRow>[] {
  return [
    {
      key: "title",
      header: "Title",
      cell: (row) => (
        <button
          onClick={() => actions.onView(row.id)}
          className="font-medium text-text-heading max-w-xs truncate block hover:text-brand transition-colors text-left"
        >
          {row.title}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      cell: (row) => {
        const config = STATUS_BADGE[row.status] ?? {
          variant: "secondary" as const,
          label: row.status,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "workMode",
      header: "Mode",
      cell: (row) => <span className="text-text-body capitalize">{row.workMode}</span>,
    },
    {
      key: "employmentType",
      header: "Type",
      cell: (row) => (
        <span className="text-text-body capitalize">{row.employmentType.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "applications",
      header: "Apps",
      className: "text-center",
      cell: (row) => (
        <span className="text-text-body text-center block">{row.applicationCount}</span>
      ),
    },
    {
      key: "views",
      header: "Views",
      className: "text-center",
      cell: (row) => <span className="text-text-body text-center block">{row.viewCount}</span>,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="View details"
            onClick={() => actions.onView(row.id)}
          >
            <ExternalLinkIcon className="size-4 text-text-muted" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Edit"
            onClick={() => actions.onEdit(row.id)}
          >
            <PencilIcon className="size-4 text-text-muted" />
          </Button>
          {row.status === "archived" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Unarchive"
              onClick={() => actions.onToggle(row.id, row.status)}
              disabled={actions.isPending}
            >
              <RotateCcwIcon className="size-4 text-success" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              title={row.status === "draft" ? "Publish" : "Archive"}
              onClick={() => actions.onToggle(row.id, row.status)}
              disabled={actions.isPending}
            >
              {row.status === "draft" ? (
                <PlayIcon className="size-4 text-success" />
              ) : (
                <ArchiveIcon className="size-4 text-warning" />
              )}
            </Button>
          )}
          <ConfirmActionButton
            dialogVariant={row.status === "archived" ? "destructive" : "warning"}
            title={
              row.status === "archived"
                ? "Permanently Delete Job"
                : row.status === "draft"
                  ? "Delete Job"
                  : "Archive Job"
            }
            description={
              row.status === "archived"
                ? `Permanently delete "${row.title}"? All associated applications will be removed.`
                : row.status === "draft"
                  ? `Delete draft "${row.title}"? This cannot be undone.`
                  : `Archive "${row.title}"? Applications will be preserved.`
            }
            confirmLabel={
              row.status === "archived"
                ? "Permanently Delete"
                : row.status === "draft"
                  ? "Delete"
                  : "Archive"
            }
            action={() => actions.onDelete(row)}
            isPending={actions.deletingId === row.id && actions.isDeleting}
            variant="ghost"
            size="icon-sm"
            tooltip={row.status === "archived" ? "Permanently delete" : "Delete"}
          >
            <Trash2Icon className="size-4 text-destructive" />
          </ConfirmActionButton>
        </div>
      ),
    },
  ];
}
