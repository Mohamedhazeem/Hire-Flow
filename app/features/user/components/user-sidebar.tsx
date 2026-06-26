"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  UserIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  BellIcon,
} from "lucide-react";
import { Sidebar, type SidebarLink, type SidebarUser } from "@/components/layout/sidebar";
import { signOut } from "@/app/features/auth/libs/auth-client";
import { useSession } from "@/app/features/auth/libs/auth-client";

const userLinks: SidebarLink[] = [
  { href: "/user", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/user/profile", label: "Profile", icon: UserIcon },
  { href: "/user/applications", label: "Applications", icon: FileTextIcon },
  { href: "/user/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/user/notifications", label: "Notifications", icon: BellIcon },
];

export function UserSidebar() {
  const router = useRouter();
  const { data: session } = useSession();

  const sidebarUser: SidebarUser | undefined = session?.user
    ? {
        name: session.user.name,
        image: session.user.image,
        role: (session.user as { role?: string }).role ?? "user",
      }
    : undefined;

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
    <Sidebar
      links={userLinks}
      roleLabel="Candidate"
      homeHref="/user"
      onSignOut={handleSignOut}
      user={sidebarUser}
    />
  );
}
