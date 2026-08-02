"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAutoRefreshSession } from "@/app/features/auth/hooks/use-auto-refresh-session";
import { AccountPopover } from "./account-popover";
import { MobileNavMenu } from "./mobile-nav-menu";
import { PublicNavbarSkeleton } from "./public-navbar-skeleton";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { MenuIcon, XIcon, LogInIcon, UserPlusIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";
import { isHiddenRoute } from "@/lib/routes";
import Image from "next/image";

export function PublicNavbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useAutoRefreshSession();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return null;
  if (isHiddenRoute(pathname)) return null;
  if (isPending) return <PublicNavbarSkeleton />;

  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-900/5 dark:bg-slate-950/80 dark:shadow-none">
      <div className="mx-auto flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-lg font-semibold text-text-heading transition hover:text-brand"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-brand/10 text-brand transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/images/Hire-Flow-Logo-Photoroom.png"
              alt="Hire Flow"
              width={36}
              height={36}
              className="h-9 w-auto"
            />
          </span>
          <span>Hire Flow</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-2">
          <NavLink href="/jobs" label="Browse Jobs" />
          <NavLink href="/employers" label="Employers" />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <AccountPopover />
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <LogInIcon className="size-4" />
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
                >
                  <UserPlusIcon className="size-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <ThemeToggle variant="icon" />

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex lg:hidden items-center justify-center rounded-full p-2 text-text-muted transition hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {menuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <MobileNavMenu
            key={pathname}
            user={
              user
                ? {
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: (user as { role?: string }).role,
                  }
                : undefined
            }
            signOut={() => {
              signOut();
              setMenuOpen(false);
            }}
            onLinkClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand dark:text-slate-300 dark:hover:bg-slate-900"
    >
      {label}
    </Link>
  );
}
