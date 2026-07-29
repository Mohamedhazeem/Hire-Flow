"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type RevertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantName: string;
  currentStatus: string;
  onConfirm: () => void;
  isPending: boolean;
};

export function RevertConfirmDialog({
  open,
  onOpenChange,
  applicantName,
  currentStatus,
  onConfirm,
  isPending,
}: RevertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revert Applicant</DialogTitle>
          <DialogDescription>
            Revert {applicantName} back to their previous status? They are currently{" "}
            <StatusBadge status={currentStatus} className="align-middle mx-0.5" />.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2Icon className="size-4 animate-spin" />}
            Revert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
