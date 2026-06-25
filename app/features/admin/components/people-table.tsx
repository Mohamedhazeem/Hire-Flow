"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/app/features/auth/libs/auth-client";
import {
  useAdminUsers,
  useRevokeUserSessions,
  useDeleteUser,
} from "@/app/features/admin/hooks/use-admin-users";
import { BanDialog } from "@/app/features/admin/components/ban-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  LogOut,
  MessageSquareTextIcon,
} from "lucide-react";

function computeChatThreadId(idA: string, idB: string): string {
  const sorted = [idA, idB].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

function capitalizeLabel(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatLabel(value: string): string {
  return capitalizeLabel(value.replace(/_/g, " "));
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

function statusBadge(banned: boolean, emailVerified: boolean) {
  return (
    <div className="flex items-center justify-center gap-2">
      {banned ? (
        <Badge variant="destructive">Banned</Badge>
      ) : (
        <Badge variant="secondary">Active</Badge>
      )}
      {!emailVerified && <Badge variant="outline">Unverified</Badge>}
    </div>
  );
}

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  color?: "default" | "error";
};

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  title,
  color = "default",
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        color === "error" ? "h-8 px-2 text-xs text-error hover:text-error" : "h-8 px-2 text-xs"
      }
    >
      <span className={cn("size-4 flex items-center justify-center", label && "sm:mr-1")}>{icon}</span>
      {label && <span className="hidden sm:inline">{label}</span>}
    </Button>
  );
}

type PeopleTableProps = {
  roleFilter?: string;
};

const ROLE_OPTIONS = ["user", "recruiter", "admin"] as const;

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type UsersApiResponse = {
  success: boolean;
  data: {
    users: UserRow[];
    total: number;
    totalPages: number;
    page: number;
    pageSize: number;
  };
};

export function PeopleTable({ roleFilter }: PeopleTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string | undefined>(roleFilter);
  const [banned, setBanned] = useState<string>("all");

  const { data, isLoading, isError, error } = useAdminUsers({
    page,
    pageSize: 20,
    search: search || undefined,
    role: role as "user" | "recruiter" | "admin" | undefined,
    banned: banned as "true" | "false" | "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const revokeSessions = useRevokeUserSessions();
  const deleteUser = useDeleteUser();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleRoleFilter = useCallback((value: string | null) => {
    // If value is 'all', null, or undefined, reset the role to undefined
    setRole(!value || value === "all" ? undefined : value);
    setPage(1);
  }, []);

  const handleBannedFilter = useCallback((value: string | null) => {
    // Fallback to "all" if the value is cleared (null)
    setBanned(value ?? "all");
    setPage(1); // Assuming you reset page here too
  }, []);

  const handleRevokeSessions = useCallback(
    (userId: string) => {
      if (confirm("Revoke all sessions for this user?")) {
        revokeSessions.mutate(userId);
      }
    },
    [revokeSessions],
  );

  const handleDelete = useCallback(
    (userId: string, userName: string) => {
      if (confirm(`Delete user "${userName}"? This cannot be undone.`)) {
        deleteUser.mutate(userId);
      }
    },
    [deleteUser],
  );

  const handleChat = useCallback(
    (targetUserId: string) => {
      const adminId = (session?.user as { id?: string })?.id;
      if (!adminId) return;
      router.push(`/admin/messages/${computeChatThreadId(adminId, targetUserId)}`);
    },
    [router, session],
  );

  const columns: ColumnDef<UserRow>[] = [
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
          {formatLabel(row.role)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => statusBadge(row.banned, row.emailVerified),
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
      cell: (row) => (
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <ActionButton
            icon={<MessageSquareTextIcon className="size-4" />}
            label="Chat"
            onClick={() => handleChat(row.id)}
            title={`Chat with ${row.name}`}
          />
          <div className="hidden sm:inline text-text-muted">|</div>
          <BanDialog
            userId={row.id}
            userName={row.name}
            currentlyBanned={row.banned}
            banReason={row.banReason}
          />
          <div className="hidden sm:inline text-text-muted">|</div>
          <ActionButton
            icon={<LogOut className="size-4" />}
            label="Revoke"
            onClick={() => handleRevokeSessions(row.id)}
            disabled={revokeSessions.isPending}
            title="Revoke sessions"
          />
          <div className="hidden sm:inline text-text-muted">|</div>
          <ActionButton
            icon={<Trash2 className="size-4" />}
            label="Delete"
            onClick={() => handleDelete(row.id, row.name)}
            disabled={deleteUser.isPending}
            title="Delete user"
            color="error"
          />
        </div>
      ),
    },
  ];

  const responseData = data as UsersApiResponse | undefined;
  const totalUsers = responseData?.data?.total ?? 0;
  const totalPages = responseData?.data?.totalPages ?? 0;
  const users = responseData?.data?.users ?? [];
  const pageSize = 20;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearch}
              className="pl-10 rounded-xl bg-bg-elevated border-border-subtle"
            />
          </div>
        {!roleFilter && (
          <Select value={role ?? "all"} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue>{role === undefined ? "All roles" : formatLabel(role)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {formatLabel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={banned} onValueChange={handleBannedFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue>
              {banned === "all" ? "All" : banned === "true" ? "Banned" : "Active"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Banned</SelectItem>
            <SelectItem value="false">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-text-muted text-sm">Loading users...</div>
      ) : isError ? (
        <div className="text-center py-12 text-error text-sm">
          {(error as Error)?.message ?? "Failed to load users"}
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={users} emptyMessage="No users found." className="[&_table]:table-auto" />
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span className="hidden sm:inline">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalUsers)} of{" "}
                {totalUsers}
              </span>
              <span className="sm:hidden text-xs">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalUsers)}/{totalUsers}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
