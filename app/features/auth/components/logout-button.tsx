"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../libs/auth-client";

export function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <button type="button" onClick={handleSignOut}>
      Logout
    </button>
  );
}
