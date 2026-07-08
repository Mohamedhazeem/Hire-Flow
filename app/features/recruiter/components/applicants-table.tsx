"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getBulkActions } from "../utils/applicant-table-utils";
import { ApplicantTableToolbar } from "./applicant-table-toolbar";
import { ApplicantTablePagination } from "./applicant-table-pagination";
import { ApplicantTableFeedback } from "./applicant-table-feedback";
import { BulkActionBar } from "./bulk-action-bar";
import { ApplicantsTableDialogs } from "./applicants-table-dialogs";
import { createApplicantTableColumns } from "./applicant-table-columns";
import { useApplicantsTable } from "./use-applicants-table";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

type ApplicantsTableProps = { jobId: string };

export function ApplicantsTable({ jobId }: ApplicantsTableProps) {
  const router = useRouter();
  const table = useApplicantsTable(jobId);

  const bulkActions = useMemo(() => getBulkActions(table.selectedRows), [table.selectedRows]);

  const columns = useMemo(
    () =>
      createApplicantTableColumns({
        recruiterId: table.recruiterId,
        onViewDetails: (id) => router.push(`/recruiter/applicants/${id}`),
        onNavigateToMessages: (tid) =>
          router.push(`/recruiter/messages?thread=${tid}`, { scroll: false }),
        onDialog: (type, applicant) => table.setDialog({ type, applicant }),
        onRevert: (row) => table.setRevertTarget(row),
        actionedIds: table.actionedIds,
      }),
    [table, router],
  );

  const handlePageChange = useCallback(
    (p: number) => table.updateParams({ page: String(p) }),
    [table],
  );

  if (table.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-36 rounded-md" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (table.isError) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load applicants. Please try again.
      </div>
    );
  }

  const hasFilters = Object.keys(Object.fromEntries(table.searchParams)).length > 1;

  return (
    <div className="space-y-4">
      <ApplicantTableToolbar
        searchInput={table.searchInput}
        onSearchChange={table.setSearchInput}
        onSearchSubmit={() => table.updateParams({ search: table.searchInput, page: "1" })}
        status={table.status}
        onStatusChange={(v) => table.updateParams({ status: v ?? "all", page: "1" })}
        exportUrl={`/api/recruiter/jobs/${jobId}/applicants/export?${table.searchParams.toString()}`}
      />

      <DataTable
        columns={columns}
        data={table.applicants}
        enableSelection
        selectedIds={table.selectedIds}
        onSelectionChange={table.setSelectedIds}
        getRowId={(row) => (row as ApplicantRow).id}
        disabledIds={table.actionedIds}
        emptyMessage={
          hasFilters
            ? "No applicants match your filters. Try clearing the filters."
            : "No applicants yet for this job."
        }
      />

      <BulkActionBar
        selectedIds={table.selectedIds}
        total={table.responseData?.total ?? 0}
        applicants={table.applicants}
        actionedIds={table.actionedIds}
        bulkActions={bulkActions}
        bulkTransitionPending={table.bulkTransition.isPending}
        onSelectAllPage={(ids) => table.setSelectedIds(new Set(ids))}
        onClear={() => table.setSelectedIds(new Set())}
        onBulkAction={table.handleBulkAction}
      />

      <ApplicantTableFeedback feedback={table.feedback} onDismiss={() => table.setFeedback(null)} />

      <ApplicantTablePagination
        page={table.responseData?.page ?? 1}
        totalPages={Math.max(1, table.responseData?.totalPages ?? 1)}
        total={table.responseData?.total ?? 0}
        hasPrevPage={table.responseData?.hasPrevPage ?? false}
        hasNextPage={table.responseData?.hasNextPage ?? false}
        onPageChange={handlePageChange}
      />

      <ApplicantsTableDialogs
        dialog={table.dialog}
        bulkDialog={table.bulkDialog}
        revertTarget={table.revertTarget}
        selectedCount={table.selectedIds.size}
        bulkTransitionPending={table.bulkTransition.isPending}
        revertTransitionPending={table.revertTransition.isPending}
        onDialogClose={() => table.setDialog({ type: "", applicant: null })}
        onBulkDialogClose={() => table.setBulkDialog("")}
        onBulkRejectConfirm={table.handleBulkRejectConfirm}
        onRevertConfirm={(id) => {
          table.handleRevert(id);
          table.setRevertTarget(null);
        }}
        onRevertClose={() => table.setRevertTarget(null)}
      />
    </div>
  );
}
