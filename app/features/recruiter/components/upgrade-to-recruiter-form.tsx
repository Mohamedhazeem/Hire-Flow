"use client";

import { useTransition } from "react";
import { upgradeToRecruiter } from "@/app/features/recruiter/actions/upgrade-to-recruiter";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { useRouter } from "next/navigation";

export function UpgradeToRecruiterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    startTransition(async () => {
      try {
        await upgradeToRecruiter();
      } catch {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmActionButton
        action={handleUpgrade}
        isPending={isPending}
        title="Switch to Employer Account?"
        description="Once you become a recruiter, you will no longer be able to apply to jobs. Your existing applications and saved jobs will still be visible."
        confirmLabel="Yes, upgrade to employer"
        cancelLabel="Cancel"
        variant="default"
        size="lg"
        className="w-full sm:w-auto"
      >
        {isPending ? "Upgrading..." : "Upgrade to Employer"}
      </ConfirmActionButton>
    </div>
  );
}
