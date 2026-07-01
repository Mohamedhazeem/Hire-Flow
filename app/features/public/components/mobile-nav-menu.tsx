"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BriefcaseIcon, LogInIcon, UserPlusIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AvatarFallback } from "@/components/shared/avatar-fallback";

type MobileUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
} | null | undefined;

type Props = {
  user: MobileUser;
  signOut: () => void;
  onLinkClick: () => void;
};

export function MobileNavMenu({ user, signOut, onLinkClick }: Props) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden lg:hidden border-t border-border-subtle bg-bg-base"
    >
      <div className="px-4 py-4 space-y-1">
        <Link
          href="/jobs"
          onClick={onLinkClick}
          className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted hover:text-text-body rounded-md hover:bg-bg-muted transition-colors"
        >
          <BriefcaseIcon className="size-4" />
          Browse Jobs
        </Link>

        <hr className="my-2 border-border-subtle" />

        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <AvatarFallback name={user.name} image={user.image} size={36} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-heading truncate">{user.name}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
            </div>
            <Link
              href={
                user.role === "admin" || user.role === "super_admin"
                  ? "/admin"
                  : user.role === "recruiter"
                    ? "/recruiter"
                    : "/user"
              }
              onClick={onLinkClick}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-body hover:bg-bg-muted rounded-md transition-colors"
            >
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-error/80 hover:bg-error/10 hover:text-error rounded-md transition-colors w-full"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onLinkClick}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted hover:text-text-body rounded-md hover:bg-bg-muted transition-colors"
            >
              <LogInIcon className="size-4" />
              Log In
            </Link>
            <Link
              href="/register"
              onClick={onLinkClick}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors"
            >
              <UserPlusIcon className="size-4" />
              Sign Up
            </Link>
          </>
        )}

        <hr className="my-2 border-border-subtle" />

        <div className="px-3 py-1.5">
          <ThemeToggle collapsed={false} />
        </div>
      </div>
    </motion.div>
  );
}
