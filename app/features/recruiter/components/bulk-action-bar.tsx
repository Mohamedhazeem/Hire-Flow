"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon, MailIcon } from "lucide-react";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";
import type { BulkActionDef } from "../utils/applicant-table-constants";

type BulkActionBarProps = {
  selectedIds: Set<string>;
  total: number;
  applicants: ApplicantRow[];
  actionedIds: Set<string>;
  bulkActions: BulkActionDef[];
  bulkTransitionPending: boolean;
  bulkEmail: boolean;
  onBulkEmailChange: (value: boolean) => void;
  onSelectAllPage: (ids: string[]) => void;
  onClear: () => void;
  onBulkAction: (targetStatus: string) => void;
};

export function BulkActionBar({
  selectedIds,
  total,
  applicants,
  actionedIds,
  bulkActions,
  bulkTransitionPending,
  bulkEmail,
  onBulkEmailChange,
  onSelectAllPage,
  onClear,
  onBulkAction,
}: BulkActionBarProps) {
  if (selectedIds.size === 0) return null;

  const selectableOnPage = applicants.filter((a) => !actionedIds.has(a.id));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-bg-surface shadow-xl p-4 sm:static sm:border sm:rounded-2xl sm:shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-heading whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          {selectedIds.size < total && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectAllPage(selectableOnPage.map((a) => a.id))}
              className="text-xs"
            >
              Select all {selectableOnPage.length} on this page
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            <RotateCcwIcon className="size-3 mr-1" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-text-body cursor-pointer select-none">
            <input
              type="checkbox"
              checked={bulkEmail}
              onChange={(e) => onBulkEmailChange(e.target.checked)}
              className="size-4 accent-brand"
            />
            <MailIcon className="size-4 text-text-muted" />
            <span className="hidden sm:inline">Also send email</span>
          </label>
          {bulkActions.length === 0 ? (
            <span className="text-xs text-text-muted">
              No bulk actions available for this selection
            </span>
          ) : (
            bulkActions.map((action) => (
              <Button
                key={action.status}
                size="sm"
                variant={action.status === "rejected" ? "destructive" : "default"}
                onClick={() => onBulkAction(action.status)}
                disabled={action.disabled || bulkTransitionPending}
                title={action.disabled ? `${action.count} of ${selectedIds.size} selected applicants support this action` : undefined}
              >
                {action.label} {action.count < selectedIds.size && `(${action.count})`}
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
