"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  UserCogIcon,
  ShieldIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/recruiters", label: "Recruiters", icon: UserCogIcon },
  { href: "/admin/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/admin/team", label: "Team", icon: ShieldIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border-subtle bg-bg-surface min-h-screen transition-all duration-200",
        sidebarOpen ? "w-64" : "w-16",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border-subtle h-14">
        {sidebarOpen && (
          <Link href="/admin" className="text-lg font-bold text-text-heading truncate">
            Admin
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-text-muted hover:bg-bg-elevated hover:text-text-heading transition-colors"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftCloseIcon className="size-4" />
          ) : (
            <PanelLeftOpenIcon className="size-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              title={sidebarOpen ? undefined : link.label}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                sidebarOpen ? "px-3" : "justify-center px-0",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-bg-elevated hover:text-text-heading",
              )}
            >
              <link.icon className="size-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
