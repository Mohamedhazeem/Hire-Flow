import { PageHeader } from "@/components/layout/page-header";
import { InviteRecruiterForm } from "@/app/features/recruiter/components/invite-recruiter-form";
import { RecruiterTeamList } from "@/app/features/recruiter/components/recruiter-team-list";
import { Suspense } from "react";

export const metadata = {
  title: "Team Management",
  description: "Manage your team members and invitations",
};

export default function RecruiterTeamPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Team Management"
        description="Invite new team members and manage your team"
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-heading">Invite Team Member</h2>
        <InviteRecruiterForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-heading">Current Team</h2>
        <Suspense
          fallback={<div className="text-text-muted text-sm py-8 text-center">Loading team...</div>}
        >
          <RecruiterTeamList />
        </Suspense>
      </section>
    </div>
  );
}
