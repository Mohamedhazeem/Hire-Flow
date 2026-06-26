import { Suspense } from "react";
import { ApplicantDetailPage } from "@/app/features/recruiter/components/applicant-detail-page";
import { ApplicantDetailSkeleton } from "@/app/features/recruiter/components/applicant-detail-skeleton";

export const metadata = {
  title: "Applicant Details | HireFlow",
  description: "View applicant profile, timeline, and messages",
};

type Props = {
  params: Promise<{ applicationId: string }>;
};

export default async function ApplicantDetailRoute({ params }: Props) {
  const { applicationId } = await params;

  return (
    <div className="space-y-6">
      <Suspense fallback={<ApplicantDetailSkeleton />}>
        <ApplicantDetailPage applicationId={applicationId} />
      </Suspense>
    </div>
  );
}
