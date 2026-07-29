import { PageHeader } from "@/components/layout/page-header";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ApplicantsTable } from "@/app/features/recruiter/components/applicants-table";

export const metadata = {
  title: "Applicants | HireFlow",
  description: "Review and manage applicants",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicantsPage({ params }: Props) {
  const { id: jobId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicants"
        description="Review, sort, and manage applicants for this position"
        actions={
          <Link
            href={`/recruiter/jobs/${jobId}`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground h-9 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="hidden sm:inline">Back to Job</span>
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className="text-text-muted text-sm py-8 text-center">Loading applicants...</div>
        }
      >
        <ApplicantsTable jobId={jobId} />
      </Suspense>
    </div>
  );
}
