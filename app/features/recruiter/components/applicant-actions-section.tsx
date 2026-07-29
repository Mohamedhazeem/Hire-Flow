"use client";

import { Button } from "@/components/ui/button";
import { NEXT_ACTIONS } from "@/app/features/recruiter/utils/applicant-table-constants";
import type { ApplicantRow } from "@/app/features/recruiter/queries/application-queries";

type ApplicantActionsSectionProps = {
  status: string;
  isPending: boolean;
  onAction: (type: string, applicant: ApplicantRow) => void;
  applicant: ApplicantRow;
};

export function ApplicantActionsSection({
  status,
  isPending,
  onAction,
  applicant,
}: ApplicantActionsSectionProps) {
  const actions = NEXT_ACTIONS[status] ?? [];
  if (actions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
      <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">
        Actions
      </h2>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.status}
            variant={action.status === "rejected" ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => onAction(action.status, applicant)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
