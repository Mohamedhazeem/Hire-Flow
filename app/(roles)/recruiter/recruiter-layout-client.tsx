"use client";

import { RecruiterSidebar } from "@/app/features/recruiter/components/recruiter-sidebar";
import { RoleLayoutClient } from "@/components/layout/role-layout-client";

export function RecruiterLayoutClient({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: { id: string; name?: string; image?: string | null; role?: string } | null;
}) {
  return (
    <RoleLayoutClient messagesBasePath="/recruiter/messages" sidebar={<RecruiterSidebar initialUser={initialUser} />}>
      {children}
    </RoleLayoutClient>
  );
}
