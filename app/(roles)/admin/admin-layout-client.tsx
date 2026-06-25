"use client";

import { AdminSidebar } from "@/app/features/admin/components/admin-sidebar";
import { RoleLayoutClient } from "@/components/layout/role-layout-client";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return <RoleLayoutClient sidebar={<AdminSidebar />}>{children}</RoleLayoutClient>;
}
