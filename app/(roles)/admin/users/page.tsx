import { PageHeader } from "@/components/layout/page-header";
import { UsersIcon } from "lucide-react";
import { PeopleTable } from "@/app/features/admin/components/people-table";

export const metadata = {
  title: "Manage Users",
  description: "View and manage all platform users",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage all registered users on the platform" icon={<UsersIcon className="size-5" />} />
      <PeopleTable roleFilter="user" />
    </div>
  );
}
