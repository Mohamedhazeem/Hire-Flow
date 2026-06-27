"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  Building2Icon,
  UsersIcon,
  BriefcaseIcon,
  BarChart3Icon,
  BellIcon,
} from "lucide-react";
import { Sidebar, type SidebarLink, type SidebarUser } from "@/components/layout/sidebar";
import { signOut } from "@/app/features/auth/libs/auth-client";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useUnreadCount } from "@/app/features/notifications/hooks/use-notifications";

const baseRecruiterLinks: SidebarLink[] = [
  { href: "/recruiter", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/recruiter/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/recruiter/company", label: "Company Profile", icon: Building2Icon },
  { href: "/recruiter/team", label: "Team Members", icon: UsersIcon },
  { href: "/recruiter/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/recruiter/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/recruiter/notifications", label: "Notifications", icon: BellIcon },
];

export function RecruiterSidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";
  const { data: unreadCount = 0 } = useUnreadCount(userId);

  const recruiterLinks: SidebarLink[] = baseRecruiterLinks.map((link) =>
    link.href === "/recruiter/notifications" ? { ...link, badge: unreadCount } : link,
  );

  const sidebarUser: SidebarUser | undefined = session?.user
    ? { name: session.user.name, image: session.user.image, role: (session.user as { role?: string }).role ?? "recruiter" }
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
      links={recruiterLinks}
      roleLabel="Recruiter"
      homeHref="/recruiter"
      onSignOut={handleSignOut}
      user={sidebarUser}
    />
  );
}
