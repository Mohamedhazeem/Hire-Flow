"use client";

import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";
import { AvatarFallback } from "@/components/shared/avatar-fallback";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon, UserIcon } from "lucide-react";

export function AccountPopover() {
  const { data: session } = useSession();
  const signOut = useSignOut();
  const user = session?.user;

  if (!user) return null;

  const role = (user as { role?: string } | undefined)?.role ?? "user";
  const dashboardHref =
    role === "admin" || role === "super_admin"
      ? "/admin"
      : role === "recruiter"
        ? "/recruiter"
        : "/user";
  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    recruiter: "Recruiter",
    user: "User",
  };
  const roleLabel = roleLabels[role] ?? "User";

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2">
        <AvatarFallback name={user.name} image={user.image} size={36} />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-64 p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border-subtle">
          <AvatarFallback name={user.name} image={user.image} size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-heading truncate" title={user.name}>
              {user.name}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
        </div>
        <div className="px-4 py-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted bg-bg-muted px-2 py-0.5 rounded-full">
            <UserIcon className="size-3" />
            {roleLabel}
          </span>
        </div>
        <div className="border-t border-border-subtle px-1 py-1">
          <Link
            href={dashboardHref}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-body hover:bg-bg-muted rounded-md transition-colors"
          >
            <LayoutDashboardIcon className="size-4 text-text-muted" />
            Go to Dashboard
          </Link>
        </div>
        <div className="border-t border-border-subtle px-1 py-1">
          <div className="px-3 py-1.5">
            <ThemeToggle collapsed={false} />
          </div>
        </div>
        <div className="border-t border-border-subtle px-1 py-1">
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-error/80 hover:bg-error/10 hover:text-error rounded-md transition-colors w-full"
          >
            <LogOutIcon className="size-4" />
            Sign Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
