import { redirect } from "next/navigation";
import { getSession } from "@/app/features/auth/libs/auth";
import { Roles } from "@/app/features/auth/schema/role.schema";
import { UpgradeToRecruiterForm } from "@/app/features/recruiter/components/upgrade-to-recruiter-form";

export const metadata = {
  title: "Become an Employer",
  description: "Upgrade your account to recruiter access and start hiring on HireFlow.",
};

export default async function BecomeEmployerPage() {
  const session = await getSession();
  const role = session?.user?.role;

  if (!session) {
    redirect("/register");
  }

  if (role === Roles.RECRUITER) {
    redirect("/recruiter");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-6">Become an Employer</h1>

      {role === Roles.ADMIN || role === Roles.SUPER_ADMIN ? (
        <div className="bg-warning/10 border border-warning/30 text-warning px-5 py-4 rounded-xl text-sm leading-relaxed">
          Admin accounts cannot be converted to employer accounts. If you would like to hire on HireFlow, sign up with a
          different email address as a job seeker and upgrade from there.
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-text-body leading-relaxed">
            Switch your account from job seeker to employer. You will gain access to the recruiter dashboard where you
            can post jobs, manage applicants, and communicate with candidates.
          </p>

          <div className="bg-accent/5 border border-accent/10 rounded-xl px-5 py-4 text-sm text-text-body leading-relaxed">
            <strong className="text-text-heading">Before you proceed:</strong> Once you upgrade, you will no longer be
            able to apply to jobs or use job-seeker features on this account. Your existing applications, saved jobs,
            and profile data will remain visible.
          </div>

          <UpgradeToRecruiterForm />
        </div>
      )}
    </div>
  );
}
