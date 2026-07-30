import { Suspense } from "react";
import { JobListPage } from "@/app/features/jobs/components/job-list-page";
import { JobListSkeleton } from "@/app/features/jobs/components/job-list-skeleton";

export const metadata = {
  title: "Browse Jobs",
  description: "Find your next opportunity",
};

export default function JobsPage() {
  return (
    <Suspense fallback={<JobListSkeleton />}>
      <JobListPage />
    </Suspense>
  );
}
