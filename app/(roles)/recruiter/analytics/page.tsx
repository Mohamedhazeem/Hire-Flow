import { Suspense } from "react";
import { RecruiterAnalyticsPage } from "@/app/features/recruiter/components/recruiter-analytics-page";

export const metadata = {
  title: "Analytics | HireFlow",
  description: "Recruiter analytics and insights",
};

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading analytics...</p>
        </div>
      }
    >
      <RecruiterAnalyticsPage />
    </Suspense>
  );
}
