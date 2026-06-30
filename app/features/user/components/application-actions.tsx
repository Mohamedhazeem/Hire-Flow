"use client";

import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { Trash2Icon, AlertCircleIcon } from "lucide-react";

type Props = {
  canWithdraw: boolean;
  isPending: boolean;
  error: string | null;
  onWithdraw: () => void;
};

export function ApplicationActions({ canWithdraw, isPending, error, onWithdraw }: Props) {
  return (
    <>
      {error && (
        <div className="flex items-start gap-2 text-sm text-error bg-error/5 border border-error/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {canWithdraw && (
        <ConfirmActionButton
          action={onWithdraw}
          isPending={isPending}
          title="Withdraw Application"
          description="Are you sure you want to withdraw this application? You can re-apply later."
          confirmLabel="Yes, withdraw"
          variant="destructive"
        >
          <Trash2Icon className="size-4" /> Withdraw Application
        </ConfirmActionButton>
      )}
    </>
  );
}
