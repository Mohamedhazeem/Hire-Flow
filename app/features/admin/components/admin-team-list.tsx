"use client";

import { useAdminInvites, useCancelInvite, useRemoveAdmin } from "@/app/features/admin/hooks/use-admin-invites";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Trash2 } from "lucide-react";

export function AdminTeamList() {
  const { data, isLoading, isError, error } = useAdminInvites();
  const cancelInvite = useCancelInvite();
  const removeAdmin = useRemoveAdmin();

  if (isLoading) {
    return <div className="text-center py-8 text-text-muted text-sm">Loading team...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-error text-sm">{(error as Error)?.message ?? "Failed to load team"}</div>;
  }

  if (!data) return null;

  type TeamRow = {
    id: string;
    name: string;
    email: string;
    type: "admin" | "invite";
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
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Invited</Badge>
        ),
    },
    {
      key: "invitedBy",
      header: "Invited By",
      cell: (row) => (
        <span className="text-sm text-text-muted">
          {row.invitedBy ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-text-muted">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) =>
        row.type === "invite" ? (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => cancelInvite.mutate(row.id)}
            disabled={cancelInvite.isPending}
            title="Cancel invite"
          >
            <X className="size-3.5 text-text-muted" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              if (confirm(`Remove ${row.name} from admin team?`)) {
                removeAdmin.mutate(row.id);
              }
            }}
            disabled={removeAdmin.isPending}
            title="Remove admin"
          >
            <Trash2 className="size-3.5 text-error" />
          </Button>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="No team members or pending invites."
    />
  );
}
