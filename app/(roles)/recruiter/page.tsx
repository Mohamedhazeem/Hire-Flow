import { requireRole } from "@/app/features/shared/api/require-role";
import { getRecruiterDashboardStats } from "@/app/features/recruiter/queries/dashboard-queries";
import { RecruiterDashboard } from "@/app/features/recruiter/components/recruiter-dashboard";
import { NoCompanyPrompt } from "@/app/features/recruiter/components/no-company-prompt";

export const metadata = {
  title: "Dashboard | HireFlow",
  description: "Your recruiter dashboard",
};

export default async function RecruiterPage() {
  const session = await requireRole(["recruiter"]);

  if (!session.companyId) {
    return <NoCompanyPrompt />;
  }

  const data = await getRecruiterDashboardStats(session.companyId);
  return <RecruiterDashboard data={data} />;
}
