"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";

export function useAutoRefreshSession() {
  const session = useSession();
  const pathname = usePathname();

  useEffect(() => {
    session.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return session;
}
