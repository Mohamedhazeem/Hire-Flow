import { checkRole } from "@/app/features/auth/utils/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkRole(["admin", "super_admin"]);

  return <>{children}</>;
}
