"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/app/features/auth/libs/auth-client";

export function useSignOut() {
  const router = useRouter();
  return async () => {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  };
}
