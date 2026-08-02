"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { NotificationDropdown } from "@/app/features/notifications/components/notification-dropdown";
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
    if (!isPending && !session) router.replace("/");
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
  if (isPending || !session) return null;

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
        {/* bg-linear-to-r from-brand/5 via-brand/5 to-transparent */}
        <div className="hidden absolute right-0 lg:flex items-center  justify-end gap-2 px-6 pt-4 pb-1 shrink-0">
          {mounted && showNotification && (
            <NotificationDropdown messagesBasePath={messagesBasePath} />
          )}
        </div>
        <div className="flex-1 flex flex-col px-4 pb-4 md:px-6 lg:px-8 lg:pb-8  overflow-y-auto min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
