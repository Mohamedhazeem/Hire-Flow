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
  { href: "/admin/team", label: "Team", icon: ShieldIcon },
  { href: "/admin/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/admin/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/admin/recruiters", label: "Recruiters", icon: UserCogIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
];

type AdminSidebarProps = {
  initialUser?: { id: string; name?: string; image?: string | null; role?: string } | null;
};

export function AdminSidebar({ initialUser }: AdminSidebarProps) {
  const { data: session } = useSession();
  const signOut = useSignOut();

  const sidebarUser: SidebarUser | undefined = initialUser
    ? {
        name: initialUser.name ?? "",
        image: initialUser.image ?? null,
        role: initialUser.role ?? "admin",
      }
    : session?.user
    ? {
        name: session.user.name,
        image: session.user.image,
        role: (session.user as { role?: string }).role ?? "admin",
      }
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
