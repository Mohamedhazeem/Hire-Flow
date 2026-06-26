"use client";

import { RecruiterSidebar } from "@/app/features/recruiter/components/recruiter-sidebar";
import { RoleLayoutClient } from "@/components/layout/role-layout-client";

export function RecruiterLayoutClient({ children }: { children: React.ReactNode }) {
  return <RoleLayoutClient sidebar={<RecruiterSidebar />}>{children}</RoleLayoutClient>;
}
