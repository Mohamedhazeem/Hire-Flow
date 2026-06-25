"use client";

import { MobileMenuButton } from "@/components/layout/mobile-menu-button";

type RoleLayoutClientProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export function RoleLayoutClient({ children, sidebar }: RoleLayoutClientProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {sidebar}
      <main className="flex flex-1 flex-col min-h-0 min-w-0 relative">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 lg:hidden">
          <MobileMenuButton />
        </div>
        <div className="flex-1 flex flex-col px-4 pb-4 md:px-6 lg:p-8 overflow-y-auto min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
