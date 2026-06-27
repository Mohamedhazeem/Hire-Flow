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
  return <PerJobAnalyticsPage jobId={id} />;
}
