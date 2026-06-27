"use client";

import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { NotificationDropdown } from "@/app/features/notifications/components/notification-dropdown";

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
  return (
    <div className="flex h-screen overflow-hidden">
      {sidebar}
      <main className="flex flex-1 flex-col min-h-0 min-w-0 relative">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 lg:hidden">
          <MobileMenuButton />
          <div className="ml-auto flex items-center gap-1">
            <NotificationDropdown messagesBasePath={messagesBasePath} />
          </div>
        </div>
        <div className="hidden lg:flex items-center bg-linear-to-r from-brand/5 via-brand/5 to-transparent justify-end gap-2 px-6 pt-4 pb-1 shrink-0">
          <NotificationDropdown messagesBasePath={messagesBasePath} />
        </div>
        <div className="flex-1 flex flex-col px-4 pb-4 md:px-6 lg:px-8 lg:pb-8  overflow-y-auto min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
