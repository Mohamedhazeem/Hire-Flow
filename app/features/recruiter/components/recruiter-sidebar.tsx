"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  Building2Icon,
  UsersIcon,
  BriefcaseIcon,
  BarChart3Icon,
} from "lucide-react";
import { Sidebar, type SidebarLink, type SidebarUser } from "@/components/layout/sidebar";
import { signOut } from "@/app/features/auth/libs/auth-client";
import { useSession } from "@/app/features/auth/libs/auth-client";

const recruiterLinks: SidebarLink[] = [
  { href: "/recruiter", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/recruiter/messages", label: "Messages", icon: MessageSquareTextIcon },
  { href: "/recruiter/company", label: "Company Profile", icon: Building2Icon },
  { href: "/recruiter/team", label: "Team Members", icon: UsersIcon },
  { href: "/recruiter/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/recruiter/analytics", label: "Analytics", icon: BarChart3Icon },
];

export function RecruiterSidebar() {
  const router = useRouter();
  const { data: session } = useSession();

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
