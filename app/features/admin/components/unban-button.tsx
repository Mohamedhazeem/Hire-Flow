"use client";

import { useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { useUnbanUser } from "@/app/features/admin/hooks/use-admin-users";

type UnbanButtonProps = {
  userId: string;
  userName: string;
  banReason?: string | null;
};

export function UnbanButton({ userId, userName, banReason }: UnbanButtonProps) {
  const unbanUser = useUnbanUser();
  const handleUnban = useCallback(() => unbanUser.mutate(userId), [unbanUser, userId]);

  return (
    <ConfirmActionButton
      action={handleUnban}
      isPending={unbanUser.isPending}
      title={`Unban ${userName}`}
      description={
        banReason
          ? `This will restore ${userName}'s access. Previous ban reason: ${banReason}`
          : `This will restore ${userName}'s access to the platform.`
      }
      confirmLabel="Unban User"
      dialogVariant="warning"
      variant="ghost"
      size="sm"
      className="bg-success/80 hover:bg-success"
    >
      <RotateCcw className="size-4 sm:mr-1" />
      <span className="hidden sm:inline">Unban</span>
    </ConfirmActionButton>
  );
}
