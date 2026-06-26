import { PageHeader } from "@/components/layout/page-header";
import { JobForm } from "@/app/features/recruiter/components/job-form";

export const metadata = {
  title: "Create Job | HireFlow",
  description: "Fill in the details for your new job posting",
};

export default function CreateJobPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Job"
        description="Fill in the details for your new job posting"
      />
      <JobForm mode="create" />
    </div>
  );
}
