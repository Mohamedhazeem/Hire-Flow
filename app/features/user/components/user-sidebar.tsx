"use client";

import {
  LayoutDashboardIcon,
  UserIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  BookmarkIcon,
  ScrollTextIcon,
} from "lucide-react";
import { Sidebar, type SidebarLink, type SidebarUser } from "@/components/layout/sidebar";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useSignOut } from "@/app/features/public/hooks/use-sign-out";

const userLinks: SidebarLink[] = [
  { href: "/user", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/user/profile", label: "Profile", icon: UserIcon },
  { href: "/user/resumes", label: "Resumes", icon: ScrollTextIcon },
  { href: "/user/applications", label: "Applications", icon: FileTextIcon },
  { href: "/user/saved-jobs", label: "Saved Jobs", icon: BookmarkIcon },
  { href: "/user/messages", label: "Messages", icon: MessageSquareTextIcon },
];

export function UserSidebar() {
  const { data: session } = useSession();
  const signOut = useSignOut();

  const sidebarUser: SidebarUser | undefined = session?.user
    ? {
        name: session.user.name,
        image: session.user.image,
        role: (session.user as { role?: string }).role ?? "user",
      }
    : undefined;

  return <Sidebar links={userLinks} roleLabel="Candidate" homeHref="/user" onSignOut={signOut} user={sidebarUser} />;
}
