import { PageHeader } from "@/components/layout/page-header";
import { InviteAdminForm } from "@/app/features/admin/components/invite-admin-form";
import { AdminTeamList } from "@/app/features/admin/components/admin-team-list";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Team",
  description: "Manage your admin team members and invitations",
};

export default function AdminTeamPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Team Management" description="Invite new admins and manage existing team members" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-heading">Invite Admin</h2>
        <InviteAdminForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-heading">Current Team</h2>
        <Suspense fallback={<div className="text-text-muted text-sm py-8 text-center">Loading team...</div>}>
          <AdminTeamList />
        </Suspense>
      </section>
    </div>
  );
}
