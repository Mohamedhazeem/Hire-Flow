"use client";

import {
  ReviewDialog,
  InviteDialog,
  ShortlistDialog,
  ScheduleInterviewDialog,
  SendOfferDialog,
  HireDialog,
  RejectDialog,
} from "@/app/features/recruiter/components/application-dialogs";
import { BulkRejectDialog } from "@/app/features/recruiter/components/bulk-reject-dialog";
import { RevertConfirmDialog } from "@/app/features/recruiter/components/revert-dialog";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

type ApplicantsTableDialogsProps = {
  dialog: { type: string; applicant: ApplicantRow | null };
  bulkDialog: string;
  revertTarget: ApplicantRow | null;
  selectedCount: number;
  bulkTransitionPending: boolean;
  revertTransitionPending: boolean;
  onDialogClose: () => void;
  onBulkDialogClose: () => void;
  onBulkRejectConfirm: (reason: string) => void;
  onRevertConfirm: (applicantId: string) => void;
  onRevertClose: () => void;
};

export function ApplicantsTableDialogs({
  dialog,
  bulkDialog,
  revertTarget,
  selectedCount,
  bulkTransitionPending,
  revertTransitionPending,
  onDialogClose,
  onBulkDialogClose,
  onBulkRejectConfirm,
  onRevertConfirm,
  onRevertClose,
}: ApplicantsTableDialogsProps) {
  return (
    <>
      <ReviewDialog
        open={dialog.type === "review"}
        onOpenChange={(open) => { if (!open) onDialogClose(); }}
        applicant={dialog.applicant}
      />
      <InviteDialog
        open={dialog.type === "invite"}
        onOpenChange={(open) => { if (!open) onDialogClose(); }}
        applicant={dialog.applicant}
      />
      <ShortlistDialog
        open={dialog.type === "shortlist"}
        onOpenChange={(open) => { if (!open) onDialogClose(); }}
        applicant={dialog.applicant}
      />
      <ScheduleInterviewDialog
        open={dialog.type === "schedule_interview"}
        onOpenChange={(open) => { if (!open) onDialogClose(); }}
        applicant={dialog.applicant}
      />
      <SendOfferDialog
        open={dialog.type === "send_offer"}
        onOpenChange={(open) => { if (!open) onDialogClose(); }}
        applicant={dialog.applicant}
      />
      <HireDialog
        open={dialog.type === "hire"}
        onOpenChange={(open) => { if (!open) onDialogClose(); }}
        applicant={dialog.applicant}
      />
      <RejectDialog
        open={dialog.type === "reject"}
        onOpenChange={(open) => { if (!open) onDialogClose(); }}
        applicant={dialog.applicant}
      />
      <BulkRejectDialog
        open={bulkDialog === "reject"}
        onOpenChange={(open) => { if (!open) onBulkDialogClose(); }}
        selectedCount={selectedCount}
        onConfirm={onBulkRejectConfirm}
        isPending={bulkTransitionPending}
      />
      <RevertConfirmDialog
        open={revertTarget !== null}
        onOpenChange={(open) => { if (!open) onRevertClose(); }}
        applicantName={revertTarget?.name ?? ""}
        currentStatus={revertTarget?.status ?? ""}
        onConfirm={() => {
          if (!revertTarget) return;
          onRevertConfirm(revertTarget.id);
        }}
        isPending={revertTransitionPending}
      />
    </>
  );
}
