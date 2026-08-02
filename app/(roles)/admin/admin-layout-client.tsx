"use client";

import { AdminSidebar } from "@/app/features/admin/components/admin-sidebar";
import { RoleLayoutClient } from "@/components/layout/role-layout-client";

export function AdminLayoutClient({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: { id: string; name?: string; image?: string | null; role?: string } | null;
}) {
  return (
    <RoleLayoutClient messagesBasePath="/admin/messages" sidebar={<AdminSidebar initialUser={initialUser} />}>
      {children}
    </RoleLayoutClient>
  );
}
