"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";

type BulkRejectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (rejectionReason: string) => void;
  isPending: boolean;
};

export function BulkRejectDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isPending,
}: BulkRejectDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setReason("");
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {selectedCount} Applicants</DialogTitle>
          <DialogDescription>
            Provide a rejection reason that will be applied to all {selectedCount} selected
            applicants.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-heading mb-1">
              Rejection Reason *
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Didn't meet experience requirements, role filled, etc."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!reason.trim() || isPending}
            >
              {isPending && <Loader2Icon className="size-4 animate-spin" />}
              Reject All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
