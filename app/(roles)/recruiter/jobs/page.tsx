import { PageHeader } from "@/components/layout/page-header";
import { Suspense } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { RecruiterJobsTable } from "@/app/features/recruiter/components/recruiter-jobs-table";

export const metadata = {
  title: "Jobs | HireFlow",
  description: "Manage your job postings",
};

function CreateJobButton() {
  return (
    <Link
      href="/recruiter/jobs/new"
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all shrink-0"
    >
      <PlusIcon className="size-4" />
      Create Job
    </Link>
  );
}

export default function RecruiterJobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Create and manage your job postings" actions={<CreateJobButton />} />
      <Suspense fallback={<div className="text-text-muted text-sm py-8 text-center">Loading jobs...</div>}>
        <RecruiterJobsTable />
      </Suspense>
    </div>
  );
}
