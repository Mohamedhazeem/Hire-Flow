"use client";

import { UserSidebar } from "@/app/features/user/components/user-sidebar";
import { RoleLayoutClient } from "@/components/layout/role-layout-client";

export function UserLayoutClient({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: { id: string; name?: string; image?: string | null; role?: string } | null;
}) {
  return (
    <RoleLayoutClient messagesBasePath="/user/messages" sidebar={<UserSidebar initialUser={initialUser} />}>
      {children}
    </RoleLayoutClient>
  );
}
