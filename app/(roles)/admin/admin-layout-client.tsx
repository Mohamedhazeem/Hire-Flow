"use client";

import { AdminSidebar } from "@/app/features/admin/components/admin-sidebar";
import { RoleLayoutClient } from "@/components/layout/role-layout-client";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayoutClient messagesBasePath="/admin/messages" sidebar={<AdminSidebar />}>
      {children}
    </RoleLayoutClient>
  );
}
