"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { RoleType, RoleSchema } from "../schema/role.schema";

export function useCheckRole(allowedRoles: RoleType[]) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session || !session.user) {
      router.push("/login");
      return;
    }

    // 3. Check roles safely
    const userRole = RoleSchema.safeParse((session.user as { role?: string }).role);

    if (!userRole.success || !allowedRoles.includes(userRole.data)) {
      router.push("/unauthorized");
    }
  }, [session, isPending, allowedRoles, router]);

  return { session: session?.user, isLoading: isPending };
}
