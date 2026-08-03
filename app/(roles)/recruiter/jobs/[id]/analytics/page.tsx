import { Suspense } from "react";
import { PerJobAnalyticsPage } from "@/app/features/recruiter/components/per-job-analytics-page";

export const metadata = {
  title: "Job Analytics | HireFlow",
  description: "Job-specific analytics and metrics",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobAnalyticsPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading job analytics...</p>
        </div>
      }
    >
      <PerJobAnalyticsPage jobId={id} />
    </Suspense>
  );
}
