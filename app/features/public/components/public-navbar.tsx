"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAutoRefreshSession } from "@/app/features/auth/hooks/use-auto-refresh-session";
import { AccountPopover } from "./account-popover";
import { MobileNavMenu } from "./mobile-nav-menu";
import { PublicNavbarSkeleton } from "./public-navbar-skeleton";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { MenuIcon, XIcon, BriefcaseIcon, LogInIcon, UserPlusIcon } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-bg-page/75 backdrop-blur-md border-b border-border-subtle">
      <div className="mx-auto px-4 md:px-6 lg:px-8 h-14 flex items-center  gap-4">
        <Link href="/" className="text-lg font-semibold text-text-heading shrink-0 flex items-center gap-2 group">
          <span className="inline-block size-10 items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <Image
              src="/images/Hire-Flow-Logo-Photoroom.png"
              alt="Hire Flow"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
          </span>
          Hire Flow
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {!pathname.startsWith("/jobs") && (
            <NavLink href="/jobs" icon={<BriefcaseIcon className="size-4" />} label="Browse Jobs" />
          )}
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          <div className="hidden lg:flex items-center gap-1">
            {user ? (
              <AccountPopover />
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-28 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors"
                >
                  <LogInIcon className="size-4" />
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="w-28 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors"
                >
                  <UserPlusIcon className="size-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          <ThemeToggle variant="icon" />

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex lg:hidden items-center justify-center size-9 rounded-md text-text-muted hover:text-text-body hover:bg-bg-muted transition-colors"
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

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-heading hover:text-text-body rounded-md hover:bg-bg-muted transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
