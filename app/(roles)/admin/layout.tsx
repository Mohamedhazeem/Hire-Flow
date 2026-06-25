import { checkRole } from "@/app/features/auth/utils/rbac";
import { AdminLayoutClient } from "./admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkRole(["admin", "super_admin"]);

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
