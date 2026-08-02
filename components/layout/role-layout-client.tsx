"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { NotificationDropdown } from "@/app/features/notifications/components/notification-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useRealtimeNotifications } from "@/app/features/notifications/hooks/use-notifications";

type RoleLayoutClientProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  messagesBasePath?: string;
};

export function RoleLayoutClient({
  children,
  sidebar,
  messagesBasePath = "/admin/messages",
}: RoleLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    const onFrame = () => setMounted(true);
    const raf = window.requestAnimationFrame(onFrame);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  // If a cached restore (back/forward after logout) mounts this layout without a
  // session, go home instead of showing role data.
  useEffect(() => {
    if (!isPending && !session) {
      const id = setTimeout(() => router.replace("/"), 0);
      return () => clearTimeout(id);
    }
  }, [isPending, session, router]);

  // Always subscribe to real-time notifications so thread list invalidations
  // from new_message notifications fire regardless of current page
  useRealtimeNotifications(userId ?? "");

  const basePath = messagesBasePath.replace("/messages", "");
  const showNotification =
    mounted &&
    pathname &&
    (pathname === basePath || pathname === basePath + "/" || pathname.startsWith(messagesBasePath));

  // Never render role content until a session is confirmed: a back/forward cache
  // restore after logout can mount this layout without a session, and showing the
  // children would expose data the proxy no longer guards.
  if (isPending)
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="hidden lg:block shrink-0 w-64 border-r border-border-subtle bg-bg-surface p-3 space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
        <main className="flex flex-1 flex-col min-h-0 min-w-0 relative">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 lg:hidden">
            <Skeleton className="size-9 rounded-lg" />
          </div>
          <div className="flex-1 flex flex-col px-4 pb-4 md:px-6 lg:px-8 lg:pb-8 overflow-y-auto min-w-0">
            <div className="mx-auto w-full max-w-4xl space-y-4 pt-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );

  if (!session) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebar}
      <main className="flex flex-1 flex-col min-h-0 min-w-0 relative">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 lg:hidden">
          <MobileMenuButton />
          {mounted && showNotification && (
            <div className="ml-auto flex items-center gap-1">
              <NotificationDropdown messagesBasePath={messagesBasePath} />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col px-4 pb-4 md:px-6 lg:px-8 lg:pb-8 overflow-y-auto min-w-0 relative">
          {mounted && showNotification && (
            <div className="hidden lg:flex absolute top-4 right-6 items-center gap-2 z-20">
              <NotificationDropdown messagesBasePath={messagesBasePath} />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
