import { checkRole } from "@/app/features/auth/utils/rbac";
import { UserLayoutClient } from "./user-layout-client";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await checkRole(["user"]);

  return <UserLayoutClient initialUser={user}>{children}</UserLayoutClient>;
}
