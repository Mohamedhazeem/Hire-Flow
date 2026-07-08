"use client";

import { Trash2, LogOut, MessageSquareTextIcon, EyeIcon } from "lucide-react";
import { ActionButton } from "@/components/shared/action-button";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { BanDialog } from "@/app/features/admin/components/ban-dialog";
import { UnbanButton } from "@/app/features/admin/components/unban-button";
import type { UserRow } from "./admin-user-types";

type TableActionsCellProps = {
  row: UserRow;
  role: string | undefined;
  onViewProfile: (userId: string) => void;
  onChat: (userId: string) => void;
  onRevokeSessions: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  revokeSessionsPending: boolean;
  deleteUserPending: boolean;
};

export function TableActionsCell({
  row,
  onViewProfile,
  onChat,
  onRevokeSessions,
  onDeleteUser,
  revokeSessionsPending,
  deleteUserPending,
}: TableActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <ActionButton
        icon={<EyeIcon className="size-4" />}
        label="Profile"
        onClick={() => onViewProfile(row.id)}
        title={`View ${row.name}'s profile`}
      />
      <div className="hidden sm:inline text-text-muted">|</div>
      <ActionButton
        icon={<MessageSquareTextIcon className="size-4" />}
        label="Chat"
        onClick={() => onChat(row.id)}
        title={`Chat with ${row.name}`}
      />
      <div className="hidden sm:inline text-text-muted">|</div>
      {row.banned ? (
        <UnbanButton userId={row.id} userName={row.name} banReason={row.banReason} />
      ) : (
        <BanDialog userId={row.id} userName={row.name} banReason={row.banReason} />
      )}
      <div className="hidden sm:inline text-text-muted">|</div>
      <ConfirmActionButton
        action={() => onRevokeSessions(row.id)}
        isPending={revokeSessionsPending}
        title="Revoke Sessions"
        description="This will sign the user out of all devices."
        confirmLabel="Revoke All Sessions"
        variant="ghost"
        size="sm"
        dialogVariant="warning"
      >
        <LogOut className="size-4 sm:mr-1" />
        <span className="hidden sm:inline">Revoke</span>
      </ConfirmActionButton>
      <div className="hidden sm:inline text-text-muted">|</div>
      <ConfirmActionButton
        action={() => onDeleteUser(row.id)}
        isPending={deleteUserPending}
        title={`Delete ${row.name}`}
        description="This will permanently delete the user account."
        confirmLabel="Delete User"
        variant="ghost"
        size="sm"
        dialogVariant="destructive"
        className="h-8 px-2 text-xs text-error hover:text-error"
      >
        <Trash2 className="size-4 sm:mr-1" />
        <span className="hidden sm:inline">Delete</span>
      </ConfirmActionButton>
    </div>
  );
}
