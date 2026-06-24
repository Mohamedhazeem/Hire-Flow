import { AdminDashboard } from "@/app/features/admin/components/admin-dashboard";

export const metadata = {
  title: "Admin Dashboard",
  description: "Platform overview and analytics",
};

export default async function AdminPage() {
  return <AdminDashboard />;
}
