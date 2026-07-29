"use client";

import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@/components/ui/data-table";
import { TableActionsCell } from "./table-actions-cell";
import type { UserRow } from "../schema/admin-user-types";

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

type PeopleTableActions = {
  onViewProfile: (userId: string) => void;
  onChat: (userId: string) => void;
  onRevokeSessions: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  revokeSessionsPending: boolean;
  deleteUserPending: boolean;
};

export function createPeopleTableColumns(role: string | undefined, actions: PeopleTableActions): ColumnDef<UserRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      align: "center",
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="font-medium text-text-heading">{row.name}</span>
          <span className="text-xs text-text-muted">{row.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      align: "center",
      cell: (row) => (
        <Badge variant="outline" className="capitalize text-xs font-medium">
          {row.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Badge variant={row.banned ? "destructive" : "secondary"}>{row.banned ? "Banned" : "Active"}</Badge>
          {!row.emailVerified && <Badge variant="outline">Unverified</Badge>}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      align: "center",
      cell: (row) => <span className="text-text-muted text-xs">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => <TableActionsCell row={row} role={role} {...actions} />,
    },
  ];
}
