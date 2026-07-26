"use client";

import {
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  Building2Icon,
  UsersIcon,
  BriefcaseIcon,
  BarChart3Icon,
} from "lucide-react";
import { Sidebar, type SidebarLink, type SidebarUser } from "@/components/layout/sidebar";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";

const recruiterLinks: SidebarLink[] = [
  { href: "/recruiter", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/recruiter/company", label: "Company Profile", icon: Building2Icon },
  { href: "/recruiter/team", label: "Team Members", icon: UsersIcon },
  { href: "/recruiter/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/recruiter/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/recruiter/analytics", label: "Analytics", icon: BarChart3Icon },
];

export function RecruiterSidebar() {
  const { data: session } = useSession();
  const signOut = useSignOut();

  const sidebarUser: SidebarUser | undefined = session?.user
    ? {
        name: session.user.name,
        image: session.user.image,
        role: (session.user as { role?: string }).role ?? "recruiter",
      }
    : undefined;

  return (
    <Sidebar
      links={recruiterLinks}
      roleLabel="Recruiter"
      homeHref="/recruiter"
      onSignOut={signOut}
      user={sidebarUser}
    />
  );
}
