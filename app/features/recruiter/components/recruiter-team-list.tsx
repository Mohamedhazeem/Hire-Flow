"use client";

import {
  useRecruiterInvites,
  useCancelInvite,
  useRemoveMember,
} from "@/app/features/recruiter/hooks/use-recruiter-invites";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { X, Trash2 } from "lucide-react";
import { useSession } from "@/app/features/auth/libs/auth-client";

export function RecruiterTeamList() {
  const { data: session } = useSession();
  const { data, isLoading, isError, error } = useRecruiterInvites();
  const cancelInvite = useCancelInvite();
  const removeMember = useRemoveMember();

  const currentUserId = session?.user?.id;

  const currentMember = data?.teamMembers.find((m) => m.user.id === currentUserId);
  const isOwner = currentMember?.role === "owner";

  if (isLoading) {
    return <div className="text-center py-8 text-text-muted text-sm">Loading team...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-error text-sm">{(error as Error)?.message ?? "Failed to load team"}</div>
    );
  }

  if (!data) return null;

  type TeamRow = {
    id: string;
    name: string;
    email: string;
    userId: string;
    type: "member" | "invite";
    memberRole?: string;
    invitedBy?: string;
    createdAt: string;
    acceptedAt?: string | null;
  };

  const rows: TeamRow[] = [
    ...data.teamMembers.map((m) => ({
      id: m.id,
      name: m.user.name ?? "Unnamed",
      email: m.user.email,
      userId: m.user.id,
      type: "member" as const,
      memberRole: m.role,
      createdAt: m.createdAt,
    })),
    ...data.invites.map((i) => ({
      id: i.id,
      name: "Pending",
      email: i.email,
      userId: "",
      type: "invite" as const,
      invitedBy: i.invitedBy.name ?? i.invitedBy.email,
      createdAt: i.createdAt,
      acceptedAt: i.acceptedAt,
    })),
  ];

  const columns: ColumnDef<TeamRow>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-heading">{row.name}</span>
          <span className="text-xs text-text-muted">{row.email}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Status",
      cell: (row) =>
        row.type === "member" ? (
          <Badge variant={row.memberRole === "owner" ? "secondary" : "secondary"}>
            {row.memberRole === "owner" ? "Owner" : "Member"}
          </Badge>
        ) : (
          <Badge variant="outline">Invited</Badge>
        ),
    },
    {
      key: "invitedBy",
      header: "Invited By",
      cell: (row) => <span className="text-sm text-text-muted">{row.invitedBy ?? "—"}</span>,
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (row) => <span className="text-xs text-text-muted">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => {
        if (row.type === "invite") {
          const isMine = row.invitedBy === (session?.user?.name ?? session?.user?.email);
          if (!isOwner && !isMine) return null;

          return (
            <ConfirmActionButton
              dialogVariant="warning"
              title="Cancel Invite"
              description={`Are you sure you want to cancel the invite for ${row.email}?`}
              confirmLabel="Cancel Invite"
              action={() => cancelInvite.mutate(row.id)}
              isPending={cancelInvite.isPending}
              variant="ghost"
              size="icon-xs"
              tooltip="Cancel invite"
            >
              <X className="size-3.5 text-text-muted" />
            </ConfirmActionButton>
          );
        }

        if (row.userId === currentUserId) {
          return <span className="text-xs text-text-muted italic">You</span>;
        }

        if (!isOwner) return null;

        return (
          <ConfirmActionButton
            dialogVariant="destructive"
            title="Remove Team Member"
            description={`Are you sure you want to remove ${row.name} from the team? This will revoke their team access.`}
            confirmLabel="Remove"
            action={() => removeMember.mutate(row.id)}
            isPending={removeMember.isPending}
            variant="ghost"
            size="icon-xs"
            tooltip="Remove team member"
          >
            <Trash2 className="size-3.5 text-error" />
          </ConfirmActionButton>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={rows} emptyMessage="No team members or pending invites." />;
}
