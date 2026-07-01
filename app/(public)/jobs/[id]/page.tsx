import { getPublicJobById } from "@/app/features/jobs/queries/public-job-queries";
import { JobDetailView } from "@/app/features/jobs/components/job-detail-view";
import type { Metadata } from "next";

function buildJobJsonLd(job: NonNullable<Awaited<ReturnType<typeof getPublicJobById>>>) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description?.slice(0, 300),
    datePosted: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
  };

  ld.hiringOrganization = { "@type": "Organization", name: job.companyName };
  if (job.companyLogo) (ld.hiringOrganization as Record<string, unknown>).logo = job.companyLogo;

  if (job.locations.length > 0) {
    ld.jobLocation = {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.locations[0] },
    };
  }
  if (job.workMode === "remote") ld.jobLocationType = "TELECOMMUTE";

  if (job.employmentType) ld.employmentType = job.employmentType.replace(/_/g, "-").toUpperCase();

  if (job.salaryMin != null || job.salaryMax != null) {
    const value: Record<string, unknown> = { "@type": "QuantitativeValue" };
    if (job.salaryMin != null) value.minValue = job.salaryMin;
    if (job.salaryMax != null) value.maxValue = job.salaryMax;
    ld.baseSalary = { "@type": "MonetaryAmount", currency: job.salaryCurrency || "USD", value };
  }

  return ld;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getPublicJobById(id);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.companyName}`,
    description: job.description?.slice(0, 160),
    other: { "application/ld+json": JSON.stringify(buildJobJsonLd(job)) },
  };
}

export default function JobDetailPage() {
  return <JobDetailView />;
}
