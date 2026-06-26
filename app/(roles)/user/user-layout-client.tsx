"use client";

import { UserSidebar } from "@/app/features/user/components/user-sidebar";
import { RoleLayoutClient } from "@/components/layout/role-layout-client";

export function UserLayoutClient({ children }: { children: React.ReactNode }) {
  return <RoleLayoutClient sidebar={<UserSidebar />}>{children}</RoleLayoutClient>;
}
