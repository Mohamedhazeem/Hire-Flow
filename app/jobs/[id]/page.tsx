import { getPublicJobById } from "@/app/features/jobs/queries/public-job-queries";
import { JobDetailView } from "@/app/features/jobs/components/job-detail-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublicJobById(id);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.companyName}`,
    description: job.description?.slice(0, 160),
  };
}

export default function JobDetailPage() {
  return <JobDetailView />;
}
