import { JobDetailView } from "@/app/features/jobs/components/job-detail-view";

export const metadata = {
  title: "Job Details",
  description: "View job details and apply",
};

export default async function JobDetailPage() {
  return <JobDetailView />;
}
