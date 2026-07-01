"use client";

import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  UserCogIcon,
  ShieldIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { Sidebar, type SidebarLink, type SidebarUser } from "@/components/layout/sidebar";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/recruiters", label: "Recruiters", icon: UserCogIcon },
  { href: "/admin/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/admin/team", label: "Team", icon: ShieldIcon },
];

export function AdminSidebar() {
  const { data: session } = useSession();
  const signOut = useSignOut();

  const sidebarUser: SidebarUser | undefined = session?.user
    ? { name: session.user.name, image: session.user.image, role: (session.user as { role?: string }).role ?? "user" }
    : undefined;

  return (
    <Sidebar
      links={adminLinks}
      roleLabel="Admin"
      homeHref="/admin"
      onSignOut={signOut}
      user={sidebarUser}
    />
  );
}
