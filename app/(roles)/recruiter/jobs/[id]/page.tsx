import { JobDetail } from "@/app/features/recruiter/components/job-detail";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    select: { title: true },
  });
  if (!job) return { title: "Job Not Found | HireFlow" };
  return { title: `${job.title} | HireFlow`, description: `View details for ${job.title}` };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    select: { id: true, slug: true },
  });

  if (!job) {
    notFound();
  }

  if (job.slug && id !== job.slug) {
    redirect(`/recruiter/jobs/${job.slug}`);
  }

  return (
    <div className="pt-4 sm:pt-6 space-y-6">
      <JobDetail jobId={job.id} />
    </div>
  );
}
