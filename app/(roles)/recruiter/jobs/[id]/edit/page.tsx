import { PageHeader } from "@/components/layout/page-header";
import { JobForm } from "@/app/features/recruiter/components/job-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { JobFormInput } from "@/app/features/recruiter/schema/job.schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!job) return { title: "Job Not Found | HireFlow" };
  return { title: `Edit ${job.title} | HireFlow` };
}

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      locations: true,
      workMode: true,
      employmentType: true,
      timezone: true,
      skills: true,
      tags: true,
      experienceLevel: true,
      salaryMin: true,
      salaryMax: true,
      salaryCurrency: true,
      applicationDeadline: true,
      status: true,
    },
  });

  if (!job) {
    notFound();
  }

  const defaultValues: JobFormInput = {
    title: job.title,
    description: job.description,
    locations: job.locations,
    workMode: job.workMode as JobFormInput["workMode"],
    employmentType: job.employmentType as JobFormInput["employmentType"],
    timezone: job.timezone ?? "",
    skills: job.skills,
    tags: job.tags,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryCurrency: job.salaryCurrency,
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString().split("T")[0] : "",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Job" description={`Update "${job.title}" details`} />
      <JobForm mode="edit" jobId={id} defaultValues={defaultValues} />
    </div>
  );
}
