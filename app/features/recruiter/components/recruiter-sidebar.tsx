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
  { href: "/recruiter/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/recruiter/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/recruiter/analytics", label: "Analytics", icon: BarChart3Icon },
];

type RecruiterSidebarProps = {
  initialUser?: { id: string; name?: string; image?: string | null; role?: string } | null;
};

export function RecruiterSidebar({ initialUser }: RecruiterSidebarProps) {
  const { data: session } = useSession();
  const signOut = useSignOut();

  const sidebarUser: SidebarUser | undefined = initialUser
    ? {
        name: initialUser.name ?? "",
        image: initialUser.image ?? null,
        role: initialUser.role ?? "recruiter",
      }
    : session?.user
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
