"use client";

import { signOut } from "@/app/features/auth/libs/auth-client";

export function useSignOut() {
  return async () => {
    await signOut();
  };
}
