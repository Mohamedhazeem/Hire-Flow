"use client";

import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { ToggleRightIcon, ToggleLeftIcon, Trash2Icon } from "lucide-react";
import type { AdminJobRow } from "@/app/features/admin/queries/job-queries";

type JobTableActionsCellProps = {
  row: AdminJobRow;
  onToggle: (jobId: string, currentActive: boolean) => void;
  onDelete: (jobId: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
};

export function JobTableActionsCell({ row, onToggle, onDelete, isToggling, isDeleting }: JobTableActionsCellProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        title={row.isActive ? "Deactivate" : "Activate"}
        onClick={() => onToggle(row.id, row.isActive)}
        disabled={isToggling}
      >
        {row.isActive ? (
          <ToggleRightIcon className="size-6 text-success" />
        ) : (
          <ToggleLeftIcon className="size-6 text-text-muted" />
        )}
      </Button>
      <ConfirmActionButton
        dialogVariant="destructive"
        title="Delete Job"
        description={`Are you sure you want to delete "${row.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        action={() => onDelete(row.id)}
        isPending={isDeleting}
        variant="ghost"
        size="icon-sm"
        tooltip="Delete job"
      >
        <Trash2Icon className="size-5 text-destructive" />
      </ConfirmActionButton>
    </div>
  );
}
