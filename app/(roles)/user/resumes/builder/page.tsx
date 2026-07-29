import { ResumeBuilderForm } from "@/app/features/user/components/resume-builder-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Build Resume | Candidate Dashboard",
  description: "Create a new resume using the builder",
};

export default function BuilderPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Build Resume" description="Fill in your details to create a structured resume" />
      <ResumeBuilderForm />
    </div>
  );
}
