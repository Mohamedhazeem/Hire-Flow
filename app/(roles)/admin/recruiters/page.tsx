import { PageHeader } from "@/components/layout/page-header";
import { PeopleTable } from "@/app/features/admin/components/people-table";

export const metadata = {
  title: "Manage Recruiters",
  description: "View and manage all recruiters on the platform",
};

export default function AdminRecruitersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruiters"
        description="Manage all recruiter accounts"
      />
      <PeopleTable roleFilter="recruiter" />
    </div>
  );
}
