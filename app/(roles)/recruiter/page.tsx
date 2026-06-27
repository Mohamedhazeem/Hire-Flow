import { requireRole } from "@/app/features/shared/api/require-role";
import { getRecruiterDashboardStats } from "@/app/features/recruiter/queries/dashboard-queries";
import { RecruiterDashboard } from "@/app/features/recruiter/components/recruiter-dashboard";
import Link from "next/link";
import { Building2Icon } from "lucide-react";

export const metadata = {
  title: "Dashboard | HireFlow",
  description: "Your recruiter dashboard",
};

export default async function RecruiterPage() {
  const session = await requireRole(["recruiter"]);

  if (!session.companyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="size-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
            <Building2Icon className="size-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-text-heading mb-2">Welcome to HireFlow</h1>
          <p className="text-text-muted text-sm mb-6">
            You&apos;re almost ready to start hiring. Create your company profile first to manage jobs and applications.
          </p>
          <Link
            href="/recruiter/company"
            className="inline-flex items-center justify-center rounded-md bg-brand text-white px-5 py-2.5 text-sm font-medium hover:bg-brand/90 transition-all"
          >
            <Building2Icon className="size-4 mr-2" />
            Create Company Profile
          </Link>
        </div>
      </div>
    );
  }

  const data = await getRecruiterDashboardStats(session.companyId);
  return <RecruiterDashboard data={data} />;
}
