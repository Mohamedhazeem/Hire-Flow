"use client";

import { Button } from "@/components/ui/button";
import {
  ReviewDialog,
  ShortlistDialog,
  ScheduleInterviewDialog,
  SendOfferDialog,
  RejectDialog,
} from "@/app/features/recruiter/components/application-dialogs";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

type ApplicantDetailDialogsProps = {
  dialog: { type: string; applicant: ApplicantRow | null };
  onDialogClose: () => void;
};

export function ApplicantDetailDialogs({ dialog, onDialogClose }: ApplicantDetailDialogsProps) {
  return (
    <>
      <ReviewDialog
        open={dialog.type === "reviewing"}
        onOpenChange={(open) => {
          if (!open) onDialogClose();
        }}
        applicant={dialog.applicant}
      />
      <ShortlistDialog
        open={dialog.type === "shortlisted"}
        onOpenChange={(open) => {
          if (!open) onDialogClose();
        }}
        applicant={dialog.applicant}
      />
      <ScheduleInterviewDialog
        open={dialog.type === "interview_scheduled"}
        onOpenChange={(open) => {
          if (!open) onDialogClose();
        }}
        applicant={dialog.applicant}
      />
      <SendOfferDialog
        open={dialog.type === "offered"}
        onOpenChange={(open) => {
          if (!open) onDialogClose();
        }}
        applicant={dialog.applicant}
      />
      <RejectDialog
        open={dialog.type === "rejected"}
        onOpenChange={(open) => {
          if (!open) onDialogClose();
        }}
        applicant={dialog.applicant}
      />
    </>
  );
}
