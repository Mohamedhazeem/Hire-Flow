"use client";

import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";
import { AvatarFallback } from "@/components/shared/avatar-fallback";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon, PaletteIcon } from "lucide-react";

const ROLE_META: Record<string, { label: string; dot: string }> = {
  super_admin: { label: "Super Admin", dot: "bg-amber-500" },
  admin: { label: "Admin", dot: "bg-emerald-500" },
  recruiter: { label: "Recruiter", dot: "bg-blue-500" },
  user: { label: "User", dot: "bg-slate-400" },
};

// Unified menu-item style – used for buttons/links and the non‑interactive row
const MENU_ITEM =
  "flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-bg-muted transition-colors w-full";

export function AccountPopover() {
  const { data: session } = useSession();
  const signOut = useSignOut();
  const user = session?.user;

  if (!user) return null;

  const role = (user as { role?: string })?.role ?? "user";
  const meta = ROLE_META[role] ?? ROLE_META.user;
  const dashboardHref =
    role === "admin" || role === "super_admin"
      ? "/admin"
      : role === "recruiter"
        ? "/recruiter"
        : "/user";

  return (
    <Popover>
      <PopoverTrigger className="rounded-full outline-hidden transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2">
        <AvatarFallback name={user.name} image={user.image} size={36} />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-72 p-1.5 overflow-hidden"
      >
        {/* ── User Info ── */}
        <div className="flex items-center gap-3 px-3 py-1.5">
          <AvatarFallback name={user.name} image={user.image} size={80} />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p
              className="text-sm font-semibold text-text-heading truncate leading-tight"
              title={user.name}
            >
              {user.name}
            </p>
            <p className="text-xs text-text-muted truncate leading-tight">{user.email}</p>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
              <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
              {meta.label}
            </span>
          </div>
        </div>

        <div className="h-px bg-border-subtle mx-2 my-0.5" aria-hidden="true" />

        {/* ── Menu Items ── */}
        <div className="flex flex-col">
          {/* Dashboard Link */}
          <Link
            href={dashboardHref}
            className={`${MENU_ITEM} group hover:text-white hover:bg-brand/90`}
          >
            <LayoutDashboardIcon className="size-4 text-text-muted shrink-0 group-hover:text-white" />
            Go to Dashboard
          </Link>

          {/* Appearance Row – visual consistency, non‑interactive container */}
          <div className={`${MENU_ITEM} cursor-default`}>
            <PaletteIcon className="size-4 text-text-muted shrink-0" />
            <ThemeToggle collapsed={false} />
            {/* <div className="ml-auto">
            </div> */}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={signOut}
            className={`${MENU_ITEM} text-error/80 hover:text-error hover:bg-error/10`}
          >
            <LogOutIcon className="size-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
