import { requireRole } from "@/app/features/shared/api/require-role";
import { AdminApplicantDetailPage } from "@/app/features/admin/components/admin-applicant-detail-page";

type Props = {
  params: Promise<{ applicationId: string }>;
};

export const metadata = {
  title: "Applicant Detail",
  description: "View applicant details, timeline, and resume",
};

export default async function AdminApplicantDetailRoute({ params }: Props) {
  await requireRole(["admin", "super_admin"]);
  const { applicationId } = await params;

  return <AdminApplicantDetailPage applicationId={applicationId} />;
}
