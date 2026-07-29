"use client";

import { useAdminInvites, useCancelInvite, useRemoveAdmin } from "@/app/features/admin/hooks/use-admin-invites";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { X, Trash2 } from "lucide-react";
import { useSession } from "@/app/features/auth/libs/auth-client";

export function AdminTeamList() {
  const { data: session } = useSession();
  const { data, isLoading, isError, error } = useAdminInvites();
  const cancelInvite = useCancelInvite();
  const removeAdmin = useRemoveAdmin();
  const userRole = (session?.user as { role?: string })?.role;
  const canRemoveAdmins = userRole === "super_admin";

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
    type: "admin" | "invite";
    role?: string;
    invitedBy?: string;
    createdAt: string;
    acceptedAt?: string | null;
  };

  const rows: TeamRow[] = [
    ...data.teamMembers.map((m) => ({
      id: m.id,
      name: m.name ?? "Unnamed",
      email: m.email,
      type: "admin" as const,
      role: m.role,
      createdAt: m.createdAt,
    })),
    ...data.invites.map((i) => ({
      id: i.id,
      name: "Pending",
      email: i.email,
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
        row.type === "admin" ? (
          <Badge variant={row.role === "super_admin" ? "default" : "secondary"}>
            {row.role === "super_admin" ? "Super Admin" : "Admin"}
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
        const isSelf = row.id === session?.user?.id;
        const isSuperAdmin = row.role === "super_admin";

        if (row.type === "invite") {
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

        if (isSelf) {
          return <span className="text-xs text-text-muted italic">You</span>;
        }

        if (isSuperAdmin) {
          return <span className="text-xs text-text-muted italic">Protected</span>;
        }

        return (
          <ConfirmActionButton
            dialogVariant="destructive"
            title="Remove Admin"
            description={`Are you sure you want to remove ${row.name} from the admin team? This will revoke their admin access.`}
            confirmLabel="Remove"
            action={() => removeAdmin.mutate(row.id)}
            isPending={removeAdmin.isPending}
            disabled={!canRemoveAdmins}
            variant="ghost"
            size="icon-xs"
            tooltip={canRemoveAdmins ? "Remove admin" : "Only super admins can remove team members"}
          >
            <Trash2 className={`size-3.5 ${canRemoveAdmins ? "text-error" : "text-text-muted"}`} />
          </ConfirmActionButton>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={rows} emptyMessage="No team members or pending invites." />;
}
