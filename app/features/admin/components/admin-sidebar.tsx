"use client";

import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  UserCogIcon,
  ShieldIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { Sidebar, type SidebarLink } from "@/components/layout/sidebar";

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/recruiters", label: "Recruiters", icon: UserCogIcon },
  { href: "/admin/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/admin/team", label: "Team", icon: ShieldIcon },
];

export function AdminSidebar() {
  return <Sidebar links={adminLinks} roleLabel="Admin" homeHref="/admin" />;
}
