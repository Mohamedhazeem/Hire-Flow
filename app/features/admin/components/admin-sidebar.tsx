"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  UserCogIcon,
  ShieldIcon,
  MessageSquareTextIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  XIcon,
} from "lucide-react";

type SidebarLinkConfig = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

const sidebarLinks: SidebarLinkConfig[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/recruiters", label: "Recruiters", icon: UserCogIcon },
  { href: "/admin/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/admin/team", label: "Team", icon: ShieldIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024 && !sidebarOpen) {
        useUIStore.getState().setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      useUIStore.getState().setSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <>
      <div className="hidden lg:block shrink-0 transition-all duration-200" style={{ width: sidebarOpen ? 256 : 64 }} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 border-r border-border-subtle bg-bg-surface h-screen transition-all duration-200 flex flex-col",
          sidebarOpen ? "w-64" : "w-16",
          "lg:z-30",
          "max-lg:data-[closed]:-translate-x-full",
        )}
        data-closed={sidebarOpen ? undefined : ""}
      >
        <div className="flex items-center justify-between p-3 border-b border-border-subtle h-14 shrink-0">
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

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                title={sidebarOpen ? undefined : link.label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                  sidebarOpen ? "px-3" : "justify-center px-0",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-bg-elevated hover:text-text-heading",
                )}
              >
                <link.icon className="size-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{link.label}</span>}
                {link.badge != null && link.badge > 0 && (
                  <span
                    className={cn(
                      "ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center size-5",
                      !sidebarOpen && "absolute -top-1 -right-1",
                    )}
                  >
                    {link.badge > 99 ? "99+" : link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 p-2 border-t border-border-subtle">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 rounded-md text-text-muted hover:bg-bg-elevated hover:text-text-heading transition-colors lg:hidden"
          >
            <XIcon className="size-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
