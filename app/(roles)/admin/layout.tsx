import { checkRole } from "@/app/features/auth/utils/rbac";
import { AdminSidebar } from "@/app/features/admin/components/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkRole(["admin", "super_admin"]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex flex-1 flex-col p-6 lg:p-8 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
