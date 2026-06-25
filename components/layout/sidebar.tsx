"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PanelLeftCloseIcon, PanelLeftOpenIcon, LogOutIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { formatPascalCase } from "@/utils/format-string";
export type SidebarLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

export type SidebarUser = {
  name: string;
  image?: string | null;
  role: string;
};

type SidebarProps = {
  links: SidebarLink[];
  roleLabel: string;
  homeHref: string;
  onSignOut: () => void;
  user?: SidebarUser;
};
const getSidebarDisplayName = (name: string, threshold = 14): string => {
  if (!name) return "";
  const formattedFullName = formatPascalCase(name);

  if (formattedFullName.length > threshold) {
    const firstName = name.trim().split(/\s+/)[0];
    return formatPascalCase(firstName);
  }

  return formattedFullName;
};
export function Sidebar({ links, roleLabel, homeHref, onSignOut, user }: SidebarProps) {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  useEffect(() => {
    const handleResize = () => {
      const state = useUIStore.getState();
      if (window.innerWidth >= 1024 && !state.sidebarOpen) {
        state.setSidebarOpen(true);
      } else if (window.innerWidth < 1024 && state.sidebarOpen) {
        state.setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      useUIStore.getState().setSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <>
      <div
        className={cn(
          "hidden md:block shrink-0 transition-all duration-200",
          sidebarOpen ? "w-64" : "w-16",
        )}
      />

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
          "max-lg:data-closed:-translate-x-full",
        )}
        data-closed={sidebarOpen ? undefined : ""}
      >
        <div
          className={`flex ${user && !sidebarOpen ? "flex-col gap-2 py-3" : "flex-row py-0"} items-center justify-between min-h-14 h-auto shrink-0 p-3 border-b border-border-subtle`}
        >
          {!user && sidebarOpen && (
            <Link href={homeHref} className="text-lg font-bold text-text-heading truncate">
              {roleLabel}
            </Link>
          )}
          {user && (
            <>
              {sidebarOpen ? (
                <div className="flex items-center gap-3 px-3 py-2.5 ">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {user.name
                        .trim()
                        .split(/\s+/)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold text-text-heading truncate block"
                      title={formatPascalCase(user.name)}
                    >
                      {getSidebarDisplayName(user.name, 14)}
                    </p>
                    <p className="text-[11px] text-text-muted capitalize truncate">
                      {user.role.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-1">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {user.name
                        .trim()
                        .split(/\s+/)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <button
            type="button"
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
          {links.map((link) => {
            const isActive =
              link.href === homeHref ? pathname === homeHref : pathname.startsWith(link.href);

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

        <div className="shrink-0 border-t border-border-subtle p-2 space-y-1">
          <div className={sidebarOpen ? "block" : "hidden lg:block"}>
            <ThemeToggle collapsed={!sidebarOpen} />
          </div>
          <button
            onClick={onSignOut}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full",
              sidebarOpen ? "px-3" : "justify-center px-0",
              "text-error/80 hover:bg-error/10 hover:text-error",
            )}
            title="Sign out"
          >
            <LogOutIcon className="size-4 shrink-0" />
            {sidebarOpen && <span className="truncate">Sign out</span>}
          </button>
          <button
            onClick={toggleSidebar}
            aria-label="Close sidebar"
            className="flex items-center justify-center w-full p-2 rounded-md text-text-muted hover:bg-bg-elevated hover:text-text-heading transition-colors lg:hidden"
          >
            <XIcon className="size-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
