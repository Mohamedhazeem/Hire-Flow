"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import {
  useAdminUsers,
  useRevokeUserSessions,
  useDeleteUser,
} from "@/app/features/admin/hooks/use-admin-users";
import { createPeopleTableColumns } from "./people-table-columns";
import { parseUsersResponse } from "../schema/admin-user-types";
import { PeopleTableToolbar } from "@/components/shared/people-table-toolbar";
import { PeopleTablePagination } from "@/components/shared/people-table-pagination";
import { DataTable } from "@/components/ui/data-table";

type PeopleTableProps = {
  roleFilter?: string;
};

function computeChatThreadId(idA: string, idB: string): string {
  const sorted = [idA, idB].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

export function PeopleTable({ roleFilter }: PeopleTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string | undefined>(roleFilter);
  const [banned, setBanned] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isError, error } = useAdminUsers({
    page,
    pageSize: 20,
    search: search || undefined,
    role: role as "user" | "recruiter" | "admin" | undefined,
    banned: banned as "true" | "false" | "all",
    sortBy,
    sortOrder,
  });

  const revokeSessions = useRevokeUserSessions();
  const deleteUser = useDeleteUser();
  const adminId = (session?.user as { id?: string })?.id;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  const handleRevokeSessions = useCallback(
    (userId: string) => revokeSessions.mutate(userId),
    [revokeSessions],
  );

  const handleDeleteUser = useCallback((userId: string) => deleteUser.mutate(userId), [deleteUser]);

  const handleViewProfile = useCallback(
    (userId: string) => {
      router.push(role === "recruiter" ? `/admin/recruiters/${userId}` : `/admin/users/${userId}`);
    },
    [router, role],
  );

  const handleChat = useCallback(
    (targetUserId: string) => {
      if (!adminId) return;
      router.push(`/admin/messages?thread=${computeChatThreadId(adminId, targetUserId)}`, {
        scroll: false,
      });
    },
    [router, adminId],
  );

  const columns = createPeopleTableColumns(role, {
    onViewProfile: handleViewProfile,
    onChat: handleChat,
    onRevokeSessions: handleRevokeSessions,
    onDeleteUser: handleDeleteUser,
    revokeSessionsPending: revokeSessions.isPending,
    deleteUserPending: deleteUser.isPending,
  });

  const { users, total, totalPages } = parseUsersResponse(data);
  const pageSize = 20;

  return (
    <div className="space-y-4">
      <PeopleTableToolbar
        search={search}
        onSearchChange={handleSearch}
        roleFilter={roleFilter}
        role={role}
        onRoleFilter={(value) => {
          setRole(!value || value === "all" ? undefined : value);
          resetPage();
        }}
        banned={banned}
        onBannedFilter={(value) => {
          setBanned(value ?? "all");
          resetPage();
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(newSortBy, newSortOrder) => {
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
          resetPage();
        }}
      />

      {isLoading ? (
        <div className="text-center py-12 text-text-muted text-sm">Loading users...</div>
      ) : isError ? (
        <div className="text-center py-12 text-error text-sm">
          {(error as Error)?.message ?? "Failed to load users"}
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={users}
            emptyMessage="No users found."
            className="[&_table]:table-auto"
          />
          <PeopleTablePagination
            page={page}
            totalPages={totalPages}
            totalUsers={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
