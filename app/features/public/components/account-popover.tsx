"use client";

import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";
import { AvatarFallback } from "@/components/shared/avatar-fallback";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";

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
      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-72 p-1 overflow-hidden">
        <div className="flex items-center gap-3 px-2 py-2.5">
          <AvatarFallback name={user.name} image={user.image} size={100} />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-semibold text-text-heading truncate leading-tight" title={user.name}>
              {user.name}
            </p>
            <p className="text-xs text-text-muted truncate leading-tight">{user.email}</p>
            <span className="inline-flex items-center rounded-full border border-border-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-muted leading-tight">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="h-px bg-border-subtle mx-2" />

        <Link
          href={dashboardHref}
          className="flex items-center gap-3 px-2 py-1.5 text-sm text-text-body rounded-md hover:bg-bg-muted transition-colors"
        >
          <LayoutDashboardIcon className="size-4 text-text-muted shrink-0" />
          Go to Dashboard
        </Link>

        <div className="h-px bg-border-subtle mx-2" />

        <div className="px-2 py-1.5 space-y-1">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Appearance</p>
          <ThemeToggle collapsed={false} />
        </div>

        <div className="h-px bg-border-subtle mx-2" />

        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 px-2 py-1.5 text-sm text-error/80 rounded-md hover:bg-error/10 hover:text-error transition-colors w-full"
        >
          <LogOutIcon className="size-4 shrink-0" />
          Sign Out
        </button>
      </PopoverContent>
    </Popover>
  );
}
