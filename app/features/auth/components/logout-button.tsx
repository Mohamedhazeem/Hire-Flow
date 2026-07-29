"use client";

import { useSignOut } from "@/app/features/public/hooks/use-sign-out";
import { LogOutIcon } from "lucide-react";

export function LogoutButton() {
  const signOut = useSignOut();

  return (
    <button
      type="button"
      onClick={signOut}
      className="inline-flex items-center gap-1.5 text-sm text-error/80 hover:text-error transition-colors"
    >
      <LogOutIcon className="size-4" />
      Logout
    </button>
  );
}
