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

    if (!session?.user) {
      router.push("/login");
      return;
    }

    const parsed = RoleSchema.safeParse(session.user.role);

    if (!parsed.success || !allowedRoles.includes(parsed.data)) {
      router.push("/unauthorized");
    }
  }, [session, isPending, allowedRoles, router]);

  return { session: session?.user, isLoading: isPending };
}
