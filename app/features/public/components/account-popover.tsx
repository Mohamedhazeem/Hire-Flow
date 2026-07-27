"use client";

import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";
import { useUnreadMessageCount } from "@/app/features/public/hooks/use-unread-message-count";
import { AvatarFallback } from "@/components/shared/avatar-fallback";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3Icon,
  BookmarkIcon,
  BriefcaseIcon,
  Building2Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareTextIcon,
  ScrollTextIcon,
  ShieldIcon,
  UserCogIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

type RoleLink = { href: string; label: string; icon: LucideIcon };

const LINKS: Record<string, RoleLink[]> = {
  super_admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/admin/team", label: "Team", icon: ShieldIcon },
    { href: "/admin/messages", label: "Messages", icon: MessageSquareTextIcon },
    { href: "/admin/jobs", label: "Jobs", icon: BriefcaseIcon },
    { href: "/admin/recruiters", label: "Recruiters", icon: UserCogIcon },
    { href: "/admin/users", label: "Users", icon: UsersIcon },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/admin/team", label: "Team", icon: ShieldIcon },
    { href: "/admin/messages", label: "Messages", icon: MessageSquareTextIcon },
    { href: "/admin/jobs", label: "Jobs", icon: BriefcaseIcon },
    { href: "/admin/recruiters", label: "Recruiters", icon: UserCogIcon },
    { href: "/admin/users", label: "Users", icon: UsersIcon },
  ],
  recruiter: [
    { href: "/recruiter", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/recruiter/company", label: "Company Profile", icon: Building2Icon },
    { href: "/recruiter/team", label: "Team Members", icon: UsersIcon },
    { href: "/recruiter/jobs", label: "Jobs", icon: BriefcaseIcon },
    { href: "/recruiter/messages", label: "Messages", icon: MessageSquareTextIcon },
    { href: "/recruiter/analytics", label: "Analytics", icon: BarChart3Icon },
  ],
  user: [
    { href: "/user", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/user/profile", label: "Profile", icon: UserIcon },
    { href: "/user/resumes", label: "Resumes", icon: ScrollTextIcon },
    { href: "/user/applications", label: "Applications", icon: FileTextIcon },
    { href: "/user/saved-jobs", label: "Saved Jobs", icon: BookmarkIcon },
    { href: "/user/messages", label: "Messages", icon: MessageSquareTextIcon },
  ],
};

const ROLE_META: Record<string, { label: string; dot: string }> = {
  super_admin: { label: "Super Admin", dot: "bg-amber-500" },
  admin: { label: "Admin", dot: "bg-emerald-500" },
  recruiter: { label: "Recruiter", dot: "bg-blue-500" },
  user: { label: "User", dot: "bg-slate-400" },
};

const MENU_ITEM =
  "flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-bg-muted transition-colors w-full";

export function AccountPopover() {
  const { data: session } = useSession();
  const signOut = useSignOut();
  const user = session?.user;
  const userId = (user as { id?: string })?.id;
  const { data: unreadCount = 0 } = useUnreadMessageCount(userId);

  if (!user) return null;

  const role = (user as { role?: string })?.role ?? "user";
  const meta = ROLE_META[role] ?? ROLE_META.user;
  const links = LINKS[role] ?? LINKS.user;

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

        {/* ── Role-specific links ── */}
        <div className="flex flex-col">
          {links.map(({ href, label, icon: Icon }, i) => (
            <Link
              key={href}
              href={href}
              className={`${MENU_ITEM} group hover:text-white hover:bg-brand/90`}
            >
              <Icon className="size-4 text-text-muted shrink-0 group-hover:text-white" />
              {label}
              {href.includes("/messages") && unreadCount > 0 && (
                <span className="ml-auto size-5 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="h-px bg-border-subtle mx-2 my-0.5" aria-hidden="true" />

        {/* ── Sign Out ── */}
        <button
          type="button"
          onClick={signOut}
          className={`${MENU_ITEM} text-error hover:text-white hover:bg-error/90`}
        >
          <LogOutIcon className="size-4 shrink-0" />
          Sign Out
        </button>
      </PopoverContent>
    </Popover>
  );
}
